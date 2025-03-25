package repository

import (
	"context"
	"encoding/json"
	"fmt"
	"inventory-service/domain"
	"inventory-service/domain/models"
	"inventory-service/infrastructure/cache"
	"inventory-service/infrastructure/db"
	"inventory-service/infrastructure/lock"
	"sort"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type ProductRepositoryImpl struct {
	client     *db.MongoClient
	dbName     string
	collection string
	redis      *cache.RedisClient
}

func NewProductRepository(client *db.MongoClient, dbName, collection string, redis *cache.RedisClient) domain.ProductRepository {
	return &ProductRepositoryImpl{
		client:     client,
		dbName:     dbName,
		collection: collection,
		redis:      redis,
	}
}

const cacheTTL = 10 * time.Minute

func (r *ProductRepositoryImpl) getLock(ctx context.Context, operation, id string) *lock.DistributedLock {
	return lock.NewDistributedLock(r.redis.Client, fmt.Sprintf("lock:product:%s:%s", operation, id), "lock-value", 30*time.Second)
}

func (r *ProductRepositoryImpl) Create(product *models.Product) error {
	ctx := context.Background()
	lock := r.getLock(ctx, "create", product.ID.Hex())
	acquired, err := lock.Acquire(ctx)
	if err != nil || !acquired {
		return fmt.Errorf("failed to acquire lock: %v", err)
	}
	defer lock.Release(ctx)

	coll := r.client.Database(r.dbName).Collection(r.collection)
	_, err = coll.InsertOne(ctx, product)
	if err != nil {
		return err
	}
	r.redis.DeleteCache(ctx, "products:all")
	return nil
}

func (r *ProductRepositoryImpl) Update(product *models.Product) error {
	ctx := context.Background()
	lock := r.getLock(ctx, "update", product.ID.Hex())
	acquired, err := lock.Acquire(ctx)
	if err != nil || !acquired {
		return fmt.Errorf("failed to acquire lock: %v", err)
	}
	defer lock.Release(ctx)

	coll := r.client.Database(r.dbName).Collection(r.collection)
	filter := bson.M{"_id": product.ID}
	update := bson.M{"$set": product}
	_, err = coll.UpdateOne(ctx, filter, update)
	if err != nil {
		return err
	}
	r.redis.DeleteCache(ctx, "products:all")
	r.redis.DeleteCache(ctx, fmt.Sprintf("product:%s", product.ID.Hex()))
	return nil
}

func (r *ProductRepositoryImpl) Delete(id string) error {
	ctx := context.Background()
	lock := r.getLock(ctx, "delete", id)
	acquired, err := lock.Acquire(ctx)
	if err != nil || !acquired {
		return fmt.Errorf("failed to acquire lock: %v", err)
	}
	defer lock.Release(ctx)

	coll := r.client.Database(r.dbName).Collection(r.collection)
	objID, _ := primitive.ObjectIDFromHex(id)
	filter := bson.M{"_id": objID}
	_, err = coll.DeleteOne(ctx, filter)
	if err != nil {
		return err
	}
	r.redis.DeleteCache(ctx, "products:all")
	r.redis.DeleteCache(ctx, fmt.Sprintf("product:%s", id))
	return nil
}

func (r *ProductRepositoryImpl) FindByID(id string) (*models.Product, error) {
	ctx := context.Background()
	cacheKey := fmt.Sprintf("product:%s", id)

	if cached, err := r.redis.GetCache(ctx, cacheKey); err == nil {
		var product models.Product
		if json.Unmarshal([]byte(cached), &product) == nil {
			return &product, nil
		}
	}

	coll := r.client.Database(r.dbName).Collection(r.collection)
	objID, _ := primitive.ObjectIDFromHex(id)
	filter := bson.M{"_id": objID}

	var product models.Product
	err := coll.FindOne(ctx, filter).Decode(&product)
	if err == mongo.ErrNoDocuments {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	data, _ := json.Marshal(product)
	r.redis.SetCache(ctx, cacheKey, string(data), cacheTTL)
	return &product, nil
}

func (r *ProductRepositoryImpl) FindAll(ctx context.Context, filter domain.ProductFilter, sortOpt domain.ProductSort, page, limit int) ([]*models.Product, int64, error) {
	cacheKey := "products:all"

	// Fetch all products from cache or MongoDB
	var allProducts []*models.Product
	if cached, err := r.redis.GetCache(ctx, cacheKey); err == nil {
		if json.Unmarshal([]byte(cached), &allProducts) == nil {
			// Cache hit
		}
	}

	if allProducts == nil { // Cache miss or invalid cache
		coll := r.client.Database(r.dbName).Collection(r.collection)
		cursor, err := coll.Find(ctx, bson.M{}) // Fetch all products without filter initially
		if err != nil {
			return nil, 0, err
		}
		defer cursor.Close(ctx)

		for cursor.Next(ctx) {
			var product models.Product
			if err := cursor.Decode(&product); err != nil {
				return nil, 0, err
			}
			allProducts = append(allProducts, &product)
		}

		// Cache the full list
		data, _ := json.Marshal(allProducts)
		r.redis.SetCache(ctx, cacheKey, string(data), cacheTTL)
	}

	// Apply filtering in-memory
	filteredProducts := allProducts
	if filter.Name != "" || filter.Category != "" || filter.PriceMin > 0 || filter.PriceMax > 0 {
		filteredProducts = nil
		for _, p := range allProducts {
			if (filter.Name == "" || strings.Contains(strings.ToLower(p.Name), strings.ToLower(filter.Name))) &&
				(filter.Category == "" || p.Category == filter.Category) &&
				(filter.PriceMin <= 0 || p.Price >= filter.PriceMin) &&
				(filter.PriceMax <= 0 || p.Price <= filter.PriceMax) {
				filteredProducts = append(filteredProducts, p)
			}
		}
	}

	// Apply sorting in-memory
	if sortOpt.Field != "" {
		sort.Slice(filteredProducts, func(i, j int) bool {
			switch sortOpt.Field {
			case "name":
				if sortOpt.Order == 1 {
					return filteredProducts[i].Name < filteredProducts[j].Name
				}
				return filteredProducts[i].Name > filteredProducts[j].Name
			case "price":
				if sortOpt.Order == 1 {
					return filteredProducts[i].Price < filteredProducts[j].Price
				}
				return filteredProducts[i].Price > filteredProducts[j].Price
			default:
				return false // No sorting for unknown fields
			}
		})
	}

	// Apply pagination in-memory
	total := int64(len(filteredProducts))
	if limit <= 0 {
		limit = len(filteredProducts) // Default to all if no limit
	}
	start := (page - 1) * limit
	if start < 0 {
		start = 0
	}
	end := start + limit
	if end > len(filteredProducts) {
		end = len(filteredProducts)
	}
	if start > len(filteredProducts) {
		return []*models.Product{}, total, nil // Empty result if page is out of range
	}

	paginatedProducts := filteredProducts[start:end]
	return paginatedProducts, total, nil
}

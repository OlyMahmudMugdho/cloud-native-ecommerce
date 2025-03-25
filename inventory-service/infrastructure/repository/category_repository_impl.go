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
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type CategoryRepositoryImpl struct {
	client     *db.MongoClient
	dbName     string
	collection string
	redis      *cache.RedisClient
}

func NewCategoryRepository(client *db.MongoClient, dbName, collection string, redis *cache.RedisClient) domain.CategoryRepository {
	return &CategoryRepositoryImpl{
		client:     client,
		dbName:     dbName,
		collection: collection,
		redis:      redis,
	}
}

func (r *CategoryRepositoryImpl) getLock(ctx context.Context, operation, id string) *lock.DistributedLock {
	return lock.NewDistributedLock(r.redis.Client, fmt.Sprintf("lock:category:%s:%s", operation, id), "lock-value", 30*time.Second)
}

func (r *CategoryRepositoryImpl) Create(category *models.Category) error {
	ctx := context.Background()
	lock := r.getLock(ctx, "create", category.ID.Hex())
	acquired, err := lock.Acquire(ctx)
	if err != nil || !acquired {
		return fmt.Errorf("failed to acquire lock: %v", err)
	}
	defer lock.Release(ctx)

	coll := r.client.Database(r.dbName).Collection(r.collection)
	_, err = coll.InsertOne(ctx, category)
	if err != nil {
		return err
	}
	r.redis.DeleteCache(ctx, "categories:all")
	return nil
}

func (r *CategoryRepositoryImpl) Update(category *models.Category) error {
	ctx := context.Background()
	lock := r.getLock(ctx, "update", category.ID.Hex())
	acquired, err := lock.Acquire(ctx)
	if err != nil || !acquired {
		return fmt.Errorf("failed to acquire lock: %v", err)
	}
	defer lock.Release(ctx)

	coll := r.client.Database(r.dbName).Collection(r.collection)
	filter := bson.M{"_id": category.ID}
	update := bson.M{"$set": category}
	_, err = coll.UpdateOne(ctx, filter, update)
	if err != nil {
		return err
	}
	r.redis.DeleteCache(ctx, "categories:all")
	r.redis.DeleteCache(ctx, fmt.Sprintf("category:%s", category.ID.Hex()))
	return nil
}

func (r *CategoryRepositoryImpl) Delete(id string) error {
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
	r.redis.DeleteCache(ctx, "categories:all")
	r.redis.DeleteCache(ctx, fmt.Sprintf("category:%s", id))
	return nil
}

func (r *CategoryRepositoryImpl) FindByID(id string) (*models.Category, error) {
	ctx := context.Background()
	cacheKey := fmt.Sprintf("category:%s", id)

	if cached, err := r.redis.GetCache(ctx, cacheKey); err == nil {
		var category models.Category
		if json.Unmarshal([]byte(cached), &category) == nil {
			return &category, nil
		}
	}

	coll := r.client.Database(r.dbName).Collection(r.collection)
	objID, _ := primitive.ObjectIDFromHex(id)
	filter := bson.M{"_id": objID}

	var category models.Category
	err := coll.FindOne(ctx, filter).Decode(&category)
	if err == mongo.ErrNoDocuments {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	data, _ := json.Marshal(category)
	r.redis.SetCache(ctx, cacheKey, string(data), cacheTTL)
	return &category, nil
}

func (r *CategoryRepositoryImpl) FindAll() ([]*models.Category, error) {
	ctx := context.Background()
	cacheKey := "categories:all"

	if cached, err := r.redis.GetCache(ctx, cacheKey); err == nil {
		var categories []*models.Category
		if json.Unmarshal([]byte(cached), &categories) == nil {
			return categories, nil
		}
	}

	coll := r.client.Database(r.dbName).Collection(r.collection)
	cursor, err := coll.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var categories []*models.Category
	for cursor.Next(ctx) {
		var category models.Category
		if err := cursor.Decode(&category); err != nil {
			return nil, err
		}
		categories = append(categories, &category)
	}

	data, _ := json.Marshal(categories)
	r.redis.SetCache(ctx, cacheKey, string(data), cacheTTL)
	return categories, nil
}

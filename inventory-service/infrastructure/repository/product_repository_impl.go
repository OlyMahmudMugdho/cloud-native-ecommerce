package repository

import (
	"context"
	"inventory-service/domain"
	"inventory-service/domain/models"
	"inventory-service/infrastructure/db"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type ProductRepositoryImpl struct {
	client     *db.MongoClient
	dbName     string
	collection string
}

func NewProductRepository(client *db.MongoClient, dbName, collection string) domain.ProductRepository {
	return &ProductRepositoryImpl{
		client:     client,
		dbName:     dbName,
		collection: collection,
	}
}

func (r *ProductRepositoryImpl) Create(product *models.Product) error {
	coll := r.client.Database(r.dbName).Collection(r.collection)
	_, err := coll.InsertOne(context.Background(), product)
	return err
}

func (r *ProductRepositoryImpl) Update(product *models.Product) error {
	coll := r.client.Database(r.dbName).Collection(r.collection)
	filter := bson.M{"_id": product.ID}
	update := bson.M{"$set": product}
	_, err := coll.UpdateOne(context.Background(), filter, update)
	return err
}

func (r *ProductRepositoryImpl) Delete(id string) error {
	coll := r.client.Database(r.dbName).Collection(r.collection)
	objID, _ := primitive.ObjectIDFromHex(id)
	filter := bson.M{"_id": objID}
	_, err := coll.DeleteOne(context.Background(), filter)
	return err
}

func (r *ProductRepositoryImpl) FindByID(id string) (*models.Product, error) {
	coll := r.client.Database(r.dbName).Collection(r.collection)
	objID, _ := primitive.ObjectIDFromHex(id)
	filter := bson.M{"_id": objID}

	var product models.Product
	err := coll.FindOne(context.Background(), filter).Decode(&product)
	if err == mongo.ErrNoDocuments {
		return nil, nil
	}
	return &product, err
}

func (r *ProductRepositoryImpl) FindAll(ctx context.Context, filter domain.ProductFilter, sort domain.ProductSort, page, limit int) ([]*models.Product, int64, error) {
	coll := r.client.Database(r.dbName).Collection(r.collection)

	// Build filter query
	query := bson.M{}
	if filter.Name != "" {
		query["name"] = bson.M{"$regex": filter.Name, "$options": "i"} // Case-insensitive partial match
	}
	if filter.Category != "" {
		query["category"] = filter.Category
	}
	if filter.PriceMin > 0 || filter.PriceMax > 0 {
		priceFilter := bson.M{}
		if filter.PriceMin > 0 {
			priceFilter["$gte"] = filter.PriceMin
		}
		if filter.PriceMax > 0 {
			priceFilter["$lte"] = filter.PriceMax
		}
		query["price"] = priceFilter
	}

	// Count total documents for pagination
	total, err := coll.CountDocuments(ctx, query)
	if err != nil {
		return nil, 0, err
	}

	// Build sort options
	sortOpt := bson.D{}
	if sort.Field != "" {
		sortOpt = append(sortOpt, bson.E{Key: sort.Field, Value: sort.Order})
	}

	// Build find options for paging and sorting
	findOptions := options.Find()
	if limit > 0 {
		findOptions.SetLimit(int64(limit))
		findOptions.SetSkip(int64((page - 1) * limit))
	}
	if len(sortOpt) > 0 {
		findOptions.SetSort(sortOpt)
	}

	// Execute query
	cursor, err := coll.Find(ctx, query, findOptions)
	if err != nil {
		return nil, 0, err
	}
	defer cursor.Close(ctx)

	var products []*models.Product
	for cursor.Next(ctx) {
		var product models.Product
		if err := cursor.Decode(&product); err != nil {
			return nil, 0, err
		}
		products = append(products, &product)
	}

	return products, total, nil
}

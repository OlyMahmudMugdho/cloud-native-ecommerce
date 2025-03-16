package repository

import (
	"context"
	"inventory-service/domain"
	"inventory-service/domain/models"
	"inventory-service/infrastructure/db"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
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

func (r *ProductRepositoryImpl) FindAll() ([]*models.Product, error) {
	coll := r.client.Database(r.dbName).Collection(r.collection)
	cursor, err := coll.Find(context.Background(), bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	var products []*models.Product
	for cursor.Next(context.Background()) {
		var product models.Product
		if err := cursor.Decode(&product); err != nil {
			return nil, err
		}
		products = append(products, &product)
	}
	return products, nil
}

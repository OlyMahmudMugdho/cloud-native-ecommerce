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

type CategoryRepositoryImpl struct {
	client     *db.MongoClient
	dbName     string
	collection string
}

func NewCategoryRepository(client *db.MongoClient, dbName, collection string) domain.CategoryRepository {
	return &CategoryRepositoryImpl{
		client:     client,
		dbName:     dbName,
		collection: collection,
	}
}

func (r *CategoryRepositoryImpl) Create(category *models.Category) error {
	coll := r.client.Database(r.dbName).Collection(r.collection)
	_, err := coll.InsertOne(context.Background(), category)
	return err
}

func (r *CategoryRepositoryImpl) Update(category *models.Category) error {
	coll := r.client.Database(r.dbName).Collection(r.collection)
	filter := bson.M{"_id": category.ID}
	update := bson.M{"$set": category}
	_, err := coll.UpdateOne(context.Background(), filter, update)
	return err
}

func (r *CategoryRepositoryImpl) Delete(id string) error {
	coll := r.client.Database(r.dbName).Collection(r.collection)
	objID, _ := primitive.ObjectIDFromHex(id)
	filter := bson.M{"_id": objID}
	_, err := coll.DeleteOne(context.Background(), filter)
	return err
}

func (r *CategoryRepositoryImpl) FindByID(id string) (*models.Category, error) {
	coll := r.client.Database(r.dbName).Collection(r.collection)
	objID, _ := primitive.ObjectIDFromHex(id)
	filter := bson.M{"_id": objID}

	var category models.Category
	err := coll.FindOne(context.Background(), filter).Decode(&category)
	if err == mongo.ErrNoDocuments {
		return nil, nil
	}
	return &category, err
}

func (r *CategoryRepositoryImpl) FindAll() ([]*models.Category, error) {
	coll := r.client.Database(r.dbName).Collection(r.collection)
	cursor, err := coll.Find(context.Background(), bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	var categories []*models.Category
	for cursor.Next(context.Background()) {
		var category models.Category
		if err := cursor.Decode(&category); err != nil {
			return nil, err
		}
		categories = append(categories, &category)
	}
	return categories, nil
}

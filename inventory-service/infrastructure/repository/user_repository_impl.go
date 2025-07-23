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

type UserRepositoryImpl struct {
	client     *db.MongoClient
	dbName     string
	collection string
}

func NewUserRepository(client *db.MongoClient, dbName, collection string) domain.UserRepository {
	return &UserRepositoryImpl{
		client:     client,
		dbName:     dbName,
		collection: collection,
	}
}

func (r *UserRepositoryImpl) Create(user *models.User) error {
	coll := r.client.Database(r.dbName).Collection(r.collection)
	_, err := coll.InsertOne(context.Background(), user)
	return err
}

func (r *UserRepositoryImpl) FindByEmail(email string) (*models.User, error) {
	coll := r.client.Database(r.dbName).Collection(r.collection)
	filter := bson.M{"email": email}

	var user models.User
	err := coll.FindOne(context.Background(), filter).Decode(&user)
	if err == mongo.ErrNoDocuments {
		return nil, nil
	}
	return &user, err
}

func (r *UserRepositoryImpl) FindByID(id string) (*models.User, error) {
	coll := r.client.Database(r.dbName).Collection(r.collection)
	objID, _ := primitive.ObjectIDFromHex(id)
	filter := bson.M{"_id": objID}

	var user models.User
	err := coll.FindOne(context.Background(), filter).Decode(&user)
	if err == mongo.ErrNoDocuments {
		return nil, nil
	}
	return &user, err
}

func (r *UserRepositoryImpl) Update(user *models.User) error {
	coll := r.client.Database(r.dbName).Collection(r.collection)
	filter := bson.M{"_id": user.ID}
	update := bson.M{"$set": user}
	_, err := coll.UpdateOne(context.Background(), filter, update)
	return err
}

func (r *UserRepositoryImpl) FindByVerificationOTP(otp string) (*models.User, error) {
	coll := r.client.Database(r.dbName).Collection(r.collection)
	filter := bson.M{"verification_otp": otp}

	var user models.User
	err := coll.FindOne(context.Background(), filter).Decode(&user)
	if err == mongo.ErrNoDocuments {
		return nil, nil
	}
	return &user, err
}

func (r *UserRepositoryImpl) FindByResetToken(token string) (*models.User, error) {
	coll := r.client.Database(r.dbName).Collection(r.collection)
	filter := bson.M{"reset_token": token}

	var user models.User
	err := coll.FindOne(context.Background(), filter).Decode(&user)
	if err == mongo.ErrNoDocuments {
		return nil, nil
	}
	return &user, err
}

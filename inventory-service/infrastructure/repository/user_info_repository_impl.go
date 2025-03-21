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

type UserInfoRepositoryImpl struct {
	collection *mongo.Collection
}

func NewUserInfoRepository(client *db.MongoClient, dbName, collectionName string) domain.UserInfoRepository {
	return &UserInfoRepositoryImpl{collection: client.Client.Database(dbName).Collection(collectionName)}
}

func (r *UserInfoRepositoryImpl) GetByID(ctx context.Context, id string) (*models.User, error) {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}
	var user models.User
	err = r.collection.FindOne(ctx, bson.M{"_id": objID}).Decode(&user)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserInfoRepositoryImpl) GetAll(ctx context.Context) ([]*models.User, error) {
	cursor, err := r.collection.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	var users []*models.User
	if err = cursor.All(ctx, &users); err != nil {
		return nil, err
	}
	return users, nil
}

func (r *UserInfoRepositoryImpl) Update(ctx context.Context, id string, user *models.User) (*models.User, error) {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}
	update := bson.M{"$set": bson.M{
		"email":       user.Email,
		"role":        user.Role,
		"is_verified": user.IsVerified,
	}}
	_, err = r.collection.UpdateOne(ctx, bson.M{"_id": objID}, update)
	if err != nil {
		return nil, err
	}
	return r.GetByID(ctx, id)
}

func (r *UserInfoRepositoryImpl) Delete(ctx context.Context, id string) error {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}
	_, err = r.collection.DeleteOne(ctx, bson.M{"_id": objID})
	return err
}

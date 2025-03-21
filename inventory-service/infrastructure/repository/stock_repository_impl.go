package repository

import (
	"context"
	"inventory-service/domain"
	"inventory-service/infrastructure/db"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type StockRepositoryImpl struct {
	collection *mongo.Collection
}

func NewStockRepository(client *db.MongoClient, dbName, collectionName string) domain.StockRepository {
	return &StockRepositoryImpl{
		collection: client.Client.Database(dbName).Collection(collectionName),
	}
}

func (r *StockRepositoryImpl) BulkUpdateStock(ctx context.Context, updates map[string]struct {
	Quantity  int
	Increment bool
}) error {
	var operations []mongo.WriteModel
	for productID, update := range updates {
		objID, err := primitive.ObjectIDFromHex(productID)
		if err != nil {
			return err
		}
		// Adjust stock based on increment flag
		stockChange := -update.Quantity
		if update.Increment {
			stockChange = update.Quantity
		}
		operation := mongo.NewUpdateOneModel().
			SetFilter(bson.M{"_id": objID}).
			SetUpdate(bson.M{"$inc": bson.M{"stock": stockChange}})
		operations = append(operations, operation)
	}

	if len(operations) == 0 {
		return nil
	}

	_, err := r.collection.BulkWrite(ctx, operations)
	return err
}

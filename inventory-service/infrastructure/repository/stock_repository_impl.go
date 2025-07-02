package repository

import (
	"context"
	"fmt"
	"inventory-service/domain"
	"inventory-service/infrastructure/cache"
	"inventory-service/infrastructure/db"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type StockRepositoryImpl struct {
	collection *mongo.Collection
	redis      *cache.RedisClient
}

func NewStockRepository(client *db.MongoClient, dbName, collectionName string, redis *cache.RedisClient) domain.StockRepository {
	return &StockRepositoryImpl{
		collection: client.Client.Database(dbName).Collection(collectionName),
		redis:      redis,
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
		r.redis.DeleteCache(ctx, fmt.Sprintf("product:%s", productID))
	}

	r.redis.DeleteCache(ctx, "products:all")

	if len(operations) == 0 {
		return nil
	}

	_, err := r.collection.BulkWrite(ctx, operations)

	r.redis.DeleteCache(ctx, "products:all")
	return err
}

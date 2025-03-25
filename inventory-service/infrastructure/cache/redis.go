package cache

import (
	"context"
	"time"

	"github.com/redis/go-redis/v9"
)

type RedisClient struct {
	*redis.Client
}

func NewRedisClient(url string) (*RedisClient, error) {
	opt, err := redis.ParseURL(url)
	if err != nil {
		return nil, err
	}
	client := redis.NewClient(opt)
	_, err = client.Ping(context.Background()).Result()
	if err != nil {
		return nil, err
	}
	return &RedisClient{client}, nil
}

func (c *RedisClient) Disconnect() {
	c.Close()
}

func (c *RedisClient) SetCache(ctx context.Context, key string, value interface{}, expiration time.Duration) error {
	return c.Set(ctx, key, value, expiration).Err()
}

func (c *RedisClient) GetCache(ctx context.Context, key string) (string, error) {
	return c.Get(ctx, key).Result()
}

func (c *RedisClient) DeleteCache(ctx context.Context, key string) error {
	return c.Del(ctx, key).Err()
}

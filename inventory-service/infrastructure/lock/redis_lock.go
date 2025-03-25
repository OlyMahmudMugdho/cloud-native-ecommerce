package lock

import (
	"context"
	"time"

	"github.com/redis/go-redis/v9"
)

type DistributedLock struct {
	client     *redis.Client
	key        string
	value      string
	expiration time.Duration
}

func NewDistributedLock(client *redis.Client, key, value string, expiration time.Duration) *DistributedLock {
	return &DistributedLock{
		client:     client,
		key:        key,
		value:      value,
		expiration: expiration,
	}
}

func (l *DistributedLock) Acquire(ctx context.Context) (bool, error) {
	success, err := l.client.SetNX(ctx, l.key, l.value, l.expiration).Result()
	if err != nil {
		return false, err
	}
	return success, nil
}

func (l *DistributedLock) Release(ctx context.Context) error {
	script := `
		if redis.call("get", KEYS[1]) == ARGV[1] then
			return redis.call("del", KEYS[1])
		else
			return 0
		end
	`
	_, err := l.client.Eval(ctx, script, []string{l.key}, l.value).Result()
	return err
}

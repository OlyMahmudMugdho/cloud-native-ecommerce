package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type User struct {
	ID                primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	Email             string             `json:"email" bson:"email"`
	Password          string             `json:"password" bson:"password"`
	Role              string             `json:"role" bson:"role"`
	IsVerified        bool               `json:"is_verified" bson:"is_verified"`
	VerificationToken string             `json:"-" bson:"verification_token"`
	ResetToken        string             `json:"-" bson:"reset_token"`
}

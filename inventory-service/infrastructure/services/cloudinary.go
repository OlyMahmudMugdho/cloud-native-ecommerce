package services

import (
	"context"
	"log"
	"mime/multipart"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
)

type CloudinaryService struct {
	cld *cloudinary.Cloudinary
}

func NewCloudinaryService(cloudName, apiKey, apiSecret string) *CloudinaryService {
	cld, _ := cloudinary.NewFromParams(cloudName, apiKey, apiSecret)
	return &CloudinaryService{cld: cld}
}

func (s *CloudinaryService) UploadImage(file multipart.File) (string, error) {
	log.Println("Uploading image...")
	log.Println(file)
	ctx := context.Background()
	resp, err := s.cld.Upload.Upload(ctx, file, uploader.UploadParams{
		Folder: "inventory",
	})
	if err != nil {
		log.Println(err)
		return "", err
	}
	log.Println(resp)
	return resp.SecureURL, nil
}

package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"
)

const (
	eurekaServer = "http://localhost:8761/eureka"
	appName      = "INVENTORY-SERVICE"
	instanceID   = "inventory-service-instance-1"
	hostName     = "localhost"
	ipAddr       = "127.0.0.1"
	port         = 8080
)

// EurekaInstanceInfo holds the instance details needed for registration.
type EurekaInstanceInfo struct {
	InstanceID       string                 `json:"instanceId"`
	HostName         string                 `json:"hostName"`
	App              string                 `json:"app"`
	VIPAddress       string                 `json:"vipAddress"`
	SecureVIPAddress string                 `json:"secureVipAddress"`
	IPAddr           string                 `json:"ipAddr"`
	Status           string                 `json:"status"`
	Port             map[string]interface{} `json:"port"`
	SecurePort       map[string]interface{} `json:"securePort"`
	DataCenterInfo   map[string]interface{} `json:"dataCenterInfo"`
	HomePageUrl      string                 `json:"homePageUrl"`
	StatusPageUrl    string                 `json:"statusPageUrl"`
	HealthCheckUrl   string                 `json:"healthCheckUrl"`
}

// EurekaRegistrationPayload wraps the instance info.
type EurekaRegistrationPayload struct {
	Instance EurekaInstanceInfo `json:"instance"`
}

// RegisterWithEureka registers the service with the Eureka server.
func RegisterWithEureka() {
	url := fmt.Sprintf("%s/apps/%s", eurekaServer, appName)
	instanceInfo := EurekaInstanceInfo{
		InstanceID:       instanceID,
		HostName:         hostName,
		App:              appName,
		VIPAddress:       appName,
		SecureVIPAddress: appName,
		IPAddr:           ipAddr,
		Status:           "UP",
		Port: map[string]interface{}{
			"$":        port,
			"@enabled": "true",
		},
		SecurePort: map[string]interface{}{
			"$":        0,
			"@enabled": "false",
		},
		DataCenterInfo: map[string]interface{}{
			"@class": "com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo",
			"name":   "MyOwn",
		},
		HomePageUrl:    fmt.Sprintf("http://%s:%d/", hostName, port),
		StatusPageUrl:  fmt.Sprintf("http://%s:%d/info", hostName, port),
		HealthCheckUrl: fmt.Sprintf("http://%s:%d/health", hostName, port),
	}

	payload := EurekaRegistrationPayload{Instance: instanceInfo}
	data, err := json.Marshal(payload)
	if err != nil {
		log.Fatalf("Error marshalling registration payload: %v", err)
	}

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(data))
	if err != nil {
		log.Fatalf("Error creating registration request: %v", err)
	}
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("Error registering with Eureka: %v", err)
		return
	}
	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)
	log.Printf("Registration response: %d %s", resp.StatusCode, string(body))
}

// SendHeartbeat periodically sends a heartbeat (PUT) to Eureka.
func SendHeartbeat() {
	for {
		// Sleep for 30 seconds before sending the next heartbeat.
		time.Sleep(30 * time.Second)
		timestamp := time.Now().UnixNano() / int64(time.Millisecond)
		url := fmt.Sprintf("%s/apps/%s/%s?status=UP&lastDirtyTimestamp=%d", eurekaServer, appName, instanceID, timestamp)
		req, err := http.NewRequest("PUT", url, nil)
		if err != nil {
			log.Printf("Error creating heartbeat request: %v", err)
			continue
		}
		client := &http.Client{}
		resp, err := client.Do(req)
		if err != nil {
			log.Printf("Error sending heartbeat: %v", err)
			continue
		}
		defer resp.Body.Close()
		body, _ := io.ReadAll(resp.Body)
		log.Printf("Heartbeat response: %d %s", resp.StatusCode, string(body))
	}
}

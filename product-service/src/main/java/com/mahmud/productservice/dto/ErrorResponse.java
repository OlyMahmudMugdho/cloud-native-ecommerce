package com.mahmud.productservice.dto;

import lombok.Getter;

// Error response DTO
@Getter
public class ErrorResponse {
    private int status;
    private String message;

    public ErrorResponse(int status, String message) {
        this.status = status;
        this.message = message;
    }

}

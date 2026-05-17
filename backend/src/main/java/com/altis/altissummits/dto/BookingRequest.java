package com.altis.altissummits.dto;

import lombok.Data;

@Data
public class BookingRequest {
    private Long userId;
    private Long departureId;
    private String paymentReference;
}

package com.altis.altissummits.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class TrekDepartureRequestDTO {
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer totalSeats;
    private Integer availableSeats;
    private String status;
}

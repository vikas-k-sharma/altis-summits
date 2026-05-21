package com.altis.altissummits.dto;

import lombok.Data;

@Data
public class TrekRequestDTO {
    private String title;
    private String description;
    private Integer durationDays;
    private Integer maxAltitudeMeters;
    private Double price;
    private String difficulty; // e.g., EASY, MODERATE, HARD, EXPERT
    private String region;

    // The raw numbers we will receive from the Next.js Leaflet map click
    private Double startLat;
    private Double startLon;
}

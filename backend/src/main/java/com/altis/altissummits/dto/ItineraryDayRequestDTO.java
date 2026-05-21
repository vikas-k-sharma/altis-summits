package com.altis.altissummits.dto;

import lombok.Data;

@Data
public class ItineraryDayRequestDTO {
    private Integer dayNumber;
    private String title;
    private String description;
    private Integer altitudeMeters;
    private String accommodationType;
}

package com.altis.altissummits.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;

import java.time.LocalDate;

@Entity
@Table(name = "trek_departures")
@Data
public class TrekDeparture {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Column(nullable = false)
    private Integer totalSeats;

    private Integer availableSeats;

    @Enumerated(EnumType.STRING)
    private DepartureStatus status = DepartureStatus.SCHEDULED;

    // Relational Mapping: Many Departures belong to One Trek
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trek_id", nullable = false)
    @JsonIgnore
    @ToString.Exclude
    private Trek trek;
}

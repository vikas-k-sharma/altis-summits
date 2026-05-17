package com.altis.altissummits.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
@Data

public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Link to the User making the booking
    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    // Link to the specific Departure date
    @ManyToOne(optional = false)
    @JoinColumn(name = "departure_id")
    private TrekDeparture departure;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus status = BookingStatus.PENDING;

    private String paymentReference;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime bookingDate;
}

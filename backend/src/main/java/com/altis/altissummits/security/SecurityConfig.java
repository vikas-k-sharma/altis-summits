package com.altis.altissummits.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        // This ensures passwords are cryptographically hashed in the database, never saved as plain text.
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable) // Disable CSRF for REST APIs (we use JWTs instead)
                .authorizeHttpRequests(auth -> auth
                        // PUBLIC ROUTES (No token required)
                        .requestMatchers("/api/v1/auth/**").permitAll() // Let people log in/register
                        .requestMatchers(HttpMethod.GET, "/api/v1/treks/**").permitAll() // Let anyone view the catalog

                        // PROTECTED ROUTES (Token required)
                        .anyRequest().authenticated()
                )
                // Tell Spring we are using stateless JWTs, not old-school server sessions
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        return http.build();
    }


}

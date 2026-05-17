package com.altis.altissummits.service;

import com.altis.altissummits.dto.auth.AuthResponse;
import com.altis.altissummits.dto.auth.LoginRequest;
import com.altis.altissummits.dto.auth.RegisterRequest;
import com.altis.altissummits.entity.User;
import com.altis.altissummits.repository.UserRepository;
import com.altis.altissummits.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        // 1. Create the new user object
        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());

        // 2. CRITICAL: Hash the password before saving!
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        userRepository.save(user);

        // 3. Generate their digital VIP pass (JWT)
        String jwtToken = jwtService.generateToken(user.getEmail());
        return AuthResponse.builder().token(jwtToken).build();
    }

    public AuthResponse login(LoginRequest request) {
        // 1. Spring Security checks the email and password against the database
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        // 2. If the code reaches here, the password was correct. Generate the token.
        String jwtToken = jwtService.generateToken(request.getEmail());
        return AuthResponse.builder().token(jwtToken).build();
    }
}
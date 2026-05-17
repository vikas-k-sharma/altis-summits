package com.altis.altissummits.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        // 1. Look for the VIP Pass in the HTTP Headers
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userEmail;

        // 2. If there is no header, or it doesn't start with "Bearer ", pass it down the chain (it might be a public route)
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 3. Extract the token (Remove the "Bearer " prefix)
        jwt = authHeader.substring(7);

        // 4. Ask the JwtService who this token belongs to
        userEmail = jwtService.extractUsername(jwt);

        // 5. If we found an email, and the user isn't already authenticated in this session...
        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            // Load the user from the database
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);

            // 6. Verify the token is cryptographically valid and not expired
            if (jwtService.isTokenValid(jwt, userEmail)) {

                // 7. Create the official Spring Security authentication object
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                );

                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // 8. Officially log the user in for this single request!
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        // 9. Let the request continue to the Controller
        filterChain.doFilter(request, response);
    }
}
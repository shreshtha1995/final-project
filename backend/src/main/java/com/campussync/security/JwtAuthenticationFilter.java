package com.campussync.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * Runs once per request: reads the "Authorization: Bearer <token>" header,
 * validates the JWT, and sets the authenticated user in the security context.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    // OncePerRequestFilter — Spring base class guaranteeing the method runs exactly once per request

    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        String header = request.getHeader("Authorization");    // read Authorization header value
        if (header != null && header.startsWith("Bearer ")) {         // Check Tokens start with 'Bearer $token' format
            String token = header.substring(7);             // extract the token
            String email = jwtUtil.extractEmail(token);               // extract Email from user token

//            the token was valid (email != null) and we haven't already authenticated this request.
            if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = userDetailsService.loadUserByUsername(email);                 // load the User
                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());                     // build an auth object
                auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));            // attaches request info (IP etc.)
                SecurityContextHolder.getContext().setAuthentication(auth);                             // log the user in Context
            }
        }
        filterChain.doFilter(request, response);
        //  it passes the request on to the next step.
        //  Whether we authenticated or not, the request continues

    }
}

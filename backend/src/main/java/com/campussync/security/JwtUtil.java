package com.campussync.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/** Creates and validates stateless JWTs. The user's email is stored as the token subject. */
@Component
public class JwtUtil {

    private final SecretKey key;   // the secret signing key, stored once.
    private final long expirationMs;

    // initialize the secret Key and expiring time
    public JwtUtil(@Value("${app.jwt.secret}") String secretKey,
                   @Value("${app.jwt.expiration-ms}") long expirationMs)
    {
        /*  turn the secret string into a real cryptographic key object (HMAC-SHA).
        We convert to bytes using UTF-8 explicitly so it behaves identically on every machine.  */
        this.key = Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
    }

    // generate token for each USER authentication
//     (A) issue a token at login
    public String generateToken(String email)
    {
        Date now = new Date();
        return Jwts.builder()
                .subject(email)                                        // who this token is for
                .issuedAt(now)                                         // when it was made
                .expiration(new Date(now.getTime()+expirationMs))      // when it dies
                .signWith(key)                                         // sign with our secret
                .compact();                                            // produce the final string  (header.payload.signature)
    }

    /** Returns the email stored in the token, or null if the token is invalid/expired. */
//    (B) check the token on every request after.
//    CustomUserDetailsService knows how to load a user.
//    JwtAuthenticationFilter runs job B on every request.
    public String extractEmail(String token)
    {
        // we have to get the claims that contain email
        try{
            Claims claims = Jwts.parser()
                    .verifyWith(key).build()                    // recheck the signature with our key (for forging or expire)
                    .parseSignedClaims(token)                   // throws if invalid/expired/tampered
                    .getPayload();                              // Extracts the payload (Claims)

            return claims.getSubject();                         // give back the email
        }
        catch (Exception e)
        {
            return null;                                        // any problem → "not valid"
        }

    }
}

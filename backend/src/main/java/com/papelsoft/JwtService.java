package com.papelsoft;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;

@Component
public class JwtService {
    private static final String ALGORITHM = "HmacSHA256";
    private static final Base64.Encoder ENCODER = Base64.getUrlEncoder().withoutPadding();
    private static final Base64.Decoder DECODER = Base64.getUrlDecoder();

    private final byte[] secret;
    private final ObjectMapper objectMapper;
    private final long tokenLifetimeSeconds;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.lifetime-seconds:28800}") long tokenLifetimeSeconds,
            ObjectMapper objectMapper) {
        if (secret.length() < 32) {
            throw new IllegalStateException("JWT_SECRET debe tener al menos 32 caracteres");
        }
        this.secret = secret.getBytes(StandardCharsets.UTF_8);
        this.tokenLifetimeSeconds = tokenLifetimeSeconds;
        this.objectMapper = objectMapper;
    }

    public String createToken(String email, String role) {
        String header = encodeJson(Map.of("alg", "HS256", "typ", "JWT"));
        String payload = encodeJson(Map.of(
                "sub", email,
                "role", role,
                "exp", Instant.now().getEpochSecond() + tokenLifetimeSeconds));
        String content = header + "." + payload;
        return content + "." + ENCODER.encodeToString(sign(content));
    }

    public Claims parseToken(String token) {
        String[] parts = token.split("\\.", -1);
        if (parts.length != 3) throw new IllegalArgumentException("Token inválido");

        String content = parts[0] + "." + parts[1];
        byte[] suppliedSignature;
        try {
            suppliedSignature = DECODER.decode(parts[2]);
        } catch (IllegalArgumentException exception) {
            throw new IllegalArgumentException("Token inválido", exception);
        }
        if (!MessageDigest.isEqual(sign(content), suppliedSignature)) {
            throw new IllegalArgumentException("Firma de token inválida");
        }

        try {
            JsonNode payload = objectMapper.readTree(
                    new String(DECODER.decode(parts[1]), StandardCharsets.UTF_8));
            String email = payload.path("sub").asText("");
            String role = payload.path("role").asText("");
            long expiresAt = payload.path("exp").asLong(0);
            if (email.isBlank() || role.isBlank() || expiresAt <= Instant.now().getEpochSecond()) {
                throw new IllegalArgumentException("Token expirado o incompleto");
            }
            return new Claims(email, role);
        } catch (JsonProcessingException exception) {
            throw new IllegalArgumentException("Contenido de token inválido", exception);
        }
    }

    private String encodeJson(Object value) {
        try {
            return ENCODER.encodeToString(objectMapper.writeValueAsBytes(value));
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("No se pudo crear el token de sesión", exception);
        }
    }

    private byte[] sign(String content) {
        try {
            Mac mac = Mac.getInstance(ALGORITHM);
            mac.init(new SecretKeySpec(secret, ALGORITHM));
            return mac.doFinal(content.getBytes(StandardCharsets.US_ASCII));
        } catch (GeneralSecurityException exception) {
            throw new IllegalStateException("No se pudo firmar el token de sesión", exception);
        }
    }

    public record Claims(String email, String role) {}
}

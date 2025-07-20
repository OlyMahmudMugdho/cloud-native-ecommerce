package com.mahmud.productservice.config;


import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.config.annotation.CorsRegistry;

import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/products/info").permitAll()
                        .requestMatchers("/products/info/**").permitAll()
                        .requestMatchers("/products/swagger-ui.html").permitAll()
                        .requestMatchers("/products/swagger-ui/**").permitAll()
			.requestMatchers("/api/products/**").permitAll()
			.requestMatchers("/api/products/cart/**").permitAll()
			.requestMatchers("/api/products/cart/*").permitAll()
                        .requestMatchers("/products/api-docs").permitAll()
                        .requestMatchers("/products/api-docs*/*").permitAll()
                        .anyRequest().authenticated()
                )
                .cors(cors -> cors.configurationSource(request -> {      // CORS configuration
                        CorsConfiguration config = new CorsConfiguration();
                        config.setAllowedOrigins(Arrays.asList("*")); // Allow All origin
                        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE"));          // Allowed methods
                        config.setAllowedHeaders(Arrays.asList("Authorization", "content-type"));        // Allow Authorization header
                        config.setAllowCredentials(false);
                        return config;
                    }))
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter()))
                );

        return http.build();
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
            // Extract roles from realm_access.roles
            var realmAccess = (java.util.Map<String, Object>) jwt.getClaims().getOrDefault("realm_access", java.util.Collections.emptyMap());
            var roles = (List<String>) realmAccess.getOrDefault("roles", java.util.Collections.emptyList());

            // Map roles to Spring Security authorities with ROLE_ prefix
            return roles.stream()
                    .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                    .collect(Collectors.toList());
        });
        return converter;
    }






}

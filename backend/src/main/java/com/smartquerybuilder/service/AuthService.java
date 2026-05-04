package com.smartquerybuilder.service;

import com.smartquerybuilder.dto.AuthResponse;
import com.smartquerybuilder.dto.LoginRequest;
import com.smartquerybuilder.dto.RegisterRequest;
import com.smartquerybuilder.entity.Role;
import com.smartquerybuilder.entity.User;
import com.smartquerybuilder.enums.RoleName;
import com.smartquerybuilder.repository.RoleRepository;
import com.smartquerybuilder.repository.UserRepository;
import com.smartquerybuilder.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final EmailService emailService;

    public void register(RegisterRequest request) {
        userRepository.findByEmail(request.email()).ifPresent(u -> {
            throw new IllegalArgumentException("Email already exists");
        });
        Role userRole = roleRepository.findByName(RoleName.ROLE_USER)
                .orElseGet(() -> {
                    Role role = new Role();
                    role.setName(RoleName.ROLE_USER);
                    return roleRepository.save(role);
                });
        User user = new User();
        user.setName(request.name());
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setVerificationToken(UUID.randomUUID().toString());
<<<<<<< HEAD
        user.setEmailVerified(true); // Automatically verify for local development
        user.getRoles().add(userRole);
=======
        user.setRole(userRole);
>>>>>>> 21df3adb2841ddce4b684f8b5432276186fdc5e7
        userRepository.save(user);
        
        try {
            emailService.sendVerificationMail(user.getEmail(), user.getVerificationToken());
        } catch (Exception e) {
            System.err.println("Failed to send verification email: " + e.getMessage());
        }
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password()));
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));
        String token = jwtService.generateToken(user.getEmail());
        Set<String> roles = Set.of(user.getRole().getName().name());
        return new AuthResponse(token, user.getEmail(), roles);
    }

    public void verifyEmail(String token) {
        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid token"));
        user.setEmailVerified(true);
        user.setVerificationToken(null);
        userRepository.save(user);
    }

    public void initiateForgotPassword(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            user.setResetToken(UUID.randomUUID().toString());
            user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(30));
            userRepository.save(user);
            try {
                emailService.sendPasswordResetMail(email, user.getResetToken());
            } catch (Exception e) {
                System.err.println("Failed to send reset email: " + e.getMessage());
            }
        });
    }

    public void resetPassword(String token, String newPassword) {
        User user = userRepository.findByResetToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid reset token"));
        if (user.getResetTokenExpiry() == null || user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Reset token expired");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);
    }
}

package com.smartquerybuilder.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    public void sendVerificationMail(String to, String token) {
        send(to, "Verify your Smart Query Builder account",
                "Click to verify: " + frontendUrl + "/verify-email?token=" + token);
    }

    public void sendPasswordResetMail(String to, String token) {
        send(to, "Reset your Smart Query Builder password",
                "Click to reset: " + frontendUrl + "/reset-password?token=" + token);
    }

    private void send(String to, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        mailSender.send(message);
    }
}

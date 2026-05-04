package com.smartquerybuilder.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.frontend-url}")
    private String frontendUrl;
    @Value("${spring.mail.username:}")
    private String smtpUsername;
    @Value("${spring.mail.password:}")
    private String smtpPassword;

    public void sendVerificationMail(String to, String token) {
        send(to, "Verify your Smart Query Builder account",
                "Click to verify: " + frontendUrl + "/verify-email?token=" + token);
    }

    public void sendPasswordResetMail(String to, String token) {
        send(to, "Reset your Smart Query Builder password",
                "Click to reset: " + frontendUrl + "/reset-password?token=" + token);
    }

    private void send(String to, String subject, String body) {
<<<<<<< HEAD
        System.out.println("---------- EMAIL START ----------");
        System.out.println("To: " + to);
        System.out.println("Subject: " + subject);
        System.out.println("Body: " + body);
        System.out.println("----------- EMAIL END -----------");

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("SMTP Error: Could not send email via server. Check your SMTP credentials in application.properties.");
=======
        if (smtpUsername == null || smtpUsername.isBlank() || smtpPassword == null || smtpPassword.isBlank()) {
            log.warn("SMTP credentials are not configured; skipping email to {}", to);
            return;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        try {
            mailSender.send(message);
        } catch (MailException ex) {
            log.error("Failed to send email to {}: {}", to, ex.getMessage());
>>>>>>> 21df3adb2841ddce4b684f8b5432276186fdc5e7
        }
    }
}

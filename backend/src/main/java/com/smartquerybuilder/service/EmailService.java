package com.smartquerybuilder.service;

import com.smartquerybuilder.entity.ModificationRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.admin-email:admin@example.com}")
    private String adminEmail;

    public void sendVerificationMail(String email, String token) {
        try {
            String verificationUrl = frontendUrl + "/verify?token=" + token;
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(email);
            message.setSubject("Verify your email");
            message.setText("Please click the link below to verify your email:\n" + verificationUrl);
            mailSender.send(message);
            System.out.println("Verification email sent successfully to: " + email);
        } catch (Exception e) {
            System.err.println("CRITICAL: Failed to send verification email to " + email + ". Error: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public void sendPasswordResetMail(String email, String token) {
        try {
            String resetUrl = frontendUrl + "/reset-password?token=" + token;
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(email);
            message.setSubject("Password Reset Request");
            message.setText("To reset your password, click the link below:\n" + resetUrl);
            mailSender.send(message);
            System.out.println("Password reset email sent successfully to: " + email);
        } catch (Exception e) {
            System.err.println("CRITICAL: Failed to send password reset email to " + email + ". Error: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public void sendApprovalNotification(String email, String queryType, String queryText) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(email);
            message.setSubject("Your SQL Query Request: APPROVED");
            message.setText(String.format(
                    "Hello,\n\nYour %s query has been APPROVED and executed successfully.\n\n" +
                    "Query Details:\n%s\n\n" +
                    "Timestamp: %s\n\n" +
                    "Thank you.",
                    queryType, queryText, java.time.LocalDateTime.now()
            ));
            mailSender.send(message);
            System.out.println("Approval notification sent to: " + email);
        } catch (Exception e) {
            System.err.println("Failed to send approval email: " + e.getMessage());
        }
    }

    public void sendRejectionNotification(String email, String queryType, String queryText) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(email);
            message.setSubject("Your SQL Query Request: REJECTED");
            message.setText(String.format(
                    "Hello,\n\nYour %s query request has been REJECTED.\n\n" +
                    "Query Details:\n%s\n\n" +
                    "Timestamp: %s\n\n" +
                    "Please contact the administrator for more details.",
                    queryType, queryText, java.time.LocalDateTime.now()
            ));
            mailSender.send(message);
            System.out.println("Rejection notification sent to: " + email);
        } catch (Exception e) {
            System.err.println("Failed to send rejection email: " + e.getMessage());
        }
    }

    public void sendAdminNotification(ModificationRequest queryRequest) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(adminEmail);
            message.setSubject("New Query Request Pending Approval");
            
            String reviewUrl = frontendUrl + "/admin-requests";
            
            message.setText(String.format(
                    "Hello Admin,\n\n" +
                    "A new database modification query request has been submitted and is pending your approval.\n\n" +
                    "--- Request Details ---\n" +
                    "* User: %s\n" +
                    "* Operation: %s\n" +
                    "* Query: %s\n" +
                    "* Status: %s\n" +
                    "* Time: %s\n\n" +
                    "Please review and action this request here:\n" +
                    "%s\n\n" +
                    "Thank you.",
                    queryRequest.getUser().getEmail(),
                    queryRequest.getActionType(),
                    queryRequest.getQueryText(),
                    queryRequest.getStatus(),
                    queryRequest.getCreatedAt(),
                    reviewUrl
            ));
            mailSender.send(message);
            System.out.println("Admin notification email sent successfully to: " + adminEmail);
        } catch (Exception e) {
            System.err.println("Failed to send admin notification email to " + adminEmail + ". Error: " + e.getMessage());
            e.printStackTrace();
        }
    }
}

package com.smartquerybuilder.config;

import com.smartquerybuilder.entity.Role;
import com.smartquerybuilder.entity.User;
import com.smartquerybuilder.enums.RoleName;
import com.smartquerybuilder.repository.RoleRepository;
import com.smartquerybuilder.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Create roles if not exist
        Role adminRole = roleRepository.findByName(RoleName.ROLE_ADMIN)
                .orElseGet(() -> {
                    Role role = new Role();
                    role.setName(RoleName.ROLE_ADMIN);
                    return roleRepository.save(role);
                });

        Role userRole = roleRepository.findByName(RoleName.ROLE_USER)
                .orElseGet(() -> {
                    Role role = new Role();
                    role.setName(RoleName.ROLE_USER);
                    return roleRepository.save(role);
                });

        // Create or update default admin
        User admin = userRepository.findByEmail("admin@example.com")
                .orElseGet(() -> {
                    User u = new User();
                    u.setEmail("admin@example.com");
                    u.setName("Admin User");
                    u.setEmailVerified(true);
                    u.setRole(adminRole);
                    return u;
                });
        admin.setPassword(passwordEncoder.encode("admin123"));
        userRepository.save(admin);
        System.out.println("Admin user password reset to: admin123");

        // Create or update ishananand930@gmail.com as admin
        User ishanAdmin = userRepository.findByEmail("ishananand930@gmail.com")
                .orElseGet(() -> {
                    User u = new User();
                    u.setEmail("ishananand930@gmail.com");
                    u.setName("Ishan Admin");
                    u.setEmailVerified(true);
                    u.setRole(adminRole);
                    return u;
                });
        ishanAdmin.setRole(adminRole);
        ishanAdmin.setPassword(passwordEncoder.encode("admin123"));
        userRepository.save(ishanAdmin);
        System.out.println("Ishan Admin user password reset to: ishananand930@gmail.com / admin123");

        // Create or update 5 dummy users
        for (int i = 1; i <= 5; i++) {
            String dummyEmail = "user" + i + "@example.com";
            int finalI = i;
            User dummyUser = userRepository.findByEmail(dummyEmail)
                    .orElseGet(() -> {
                        User u = new User();
                        u.setEmail(dummyEmail);
                        u.setName("Dummy User " + finalI);
                        u.setEmailVerified(true);
                        u.setRole(userRole);
                        return u;
                    });
            dummyUser.setPassword(passwordEncoder.encode("password" + i));
            userRepository.save(dummyUser);
            System.out.println("Dummy user password reset to: " + dummyEmail + " / password" + i);
        }
    }
}

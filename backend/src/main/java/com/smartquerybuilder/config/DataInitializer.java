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

        // Create default admin if not exist
        if (userRepository.findByEmail("admin@example.com").isEmpty()) {
            User admin = new User();
            admin.setName("Admin User");
            admin.setEmail("admin@example.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setEmailVerified(true);
            admin.setRole(adminRole);
            userRepository.save(admin);
            System.out.println("Default admin user created: admin@example.com / admin123");
        }

        // Create 5 dummy users
        for (int i = 1; i <= 5; i++) {
            String dummyEmail = "user" + i + "@example.com";
            if (userRepository.findByEmail(dummyEmail).isEmpty()) {
                User dummyUser = new User();
                dummyUser.setName("Dummy User " + i);
                dummyUser.setEmail(dummyEmail);
                dummyUser.setPassword(passwordEncoder.encode("password" + i));
                dummyUser.setEmailVerified(true);
                dummyUser.setRole(userRole);
                userRepository.save(dummyUser);
                System.out.println("Dummy user created: " + dummyEmail);
            }
        }
    }
}

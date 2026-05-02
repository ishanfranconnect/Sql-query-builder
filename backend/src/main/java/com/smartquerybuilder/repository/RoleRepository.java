package com.smartquerybuilder.repository;

import com.smartquerybuilder.entity.Role;
import com.smartquerybuilder.enums.RoleName;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(RoleName name);
}

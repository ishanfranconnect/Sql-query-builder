package com.smartquerybuilder.repository;

import com.smartquerybuilder.entity.ModificationRequest;
import com.smartquerybuilder.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ModificationRequestRepository extends JpaRepository<ModificationRequest, Long> {
    List<ModificationRequest> findByUserOrderByCreatedAtDesc(User user);
    List<ModificationRequest> findByStatusOrderByCreatedAtDesc(String status);
}

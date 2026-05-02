package com.smartquerybuilder.repository;

import com.smartquerybuilder.entity.SavedQuery;
import com.smartquerybuilder.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SavedQueryRepository extends JpaRepository<SavedQuery, Long> {
    List<SavedQuery> findByUserOrderByCreatedAtDesc(User user);
}

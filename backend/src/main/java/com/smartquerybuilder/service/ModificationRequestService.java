package com.smartquerybuilder.service;

import com.smartquerybuilder.dto.QueryBuilderRequest;
import com.smartquerybuilder.entity.ModificationRequest;
import com.smartquerybuilder.entity.User;
import com.smartquerybuilder.repository.ModificationRequestRepository;
import com.smartquerybuilder.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@lombok.extern.slf4j.Slf4j
public class ModificationRequestService {

    private final ModificationRequestRepository repository;
    private final UserRepository userRepository;
    private final QueryExecutionService queryExecutionService;
    private final ObjectMapper objectMapper;

    public ModificationRequest createRequest(String email, QueryBuilderRequest request) throws Exception {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        ModificationRequest modRequest = new ModificationRequest();
        modRequest.setUser(user);
        modRequest.setActionType(request.type());
        modRequest.setTargetTable(request.from());
        modRequest.setPayload(objectMapper.writeValueAsString(request));
        modRequest.setStatus("PENDING");
        modRequest.setCreatedAt(LocalDateTime.now());

        log.info("Request Created: ID={}, User={}, Action={}, Table={}", 
                modRequest.getId(), email, request.type(), request.from());
        return repository.save(modRequest);
    }

    public List<ModificationRequest> getAllRequests() {
        return repository.findAll();
    }

    public List<ModificationRequest> getMyRequests(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return repository.findByUserOrderByCreatedAtDesc(user);
    }

    @Transactional
    public ModificationRequest approveRequest(Long requestId, String adminEmail) throws Exception {
        ModificationRequest modRequest = repository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Request not found"));
        
        if (!"PENDING".equals(modRequest.getStatus())) {
            throw new IllegalStateException("Request is already " + modRequest.getStatus());
        }

        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new IllegalArgumentException("Admin not found"));

        // Execute the operation
        log.info("Request Approved: ID={}, Admin={}", requestId, adminEmail);
        QueryBuilderRequest request = objectMapper.readValue(modRequest.getPayload(), QueryBuilderRequest.class);
        log.info("Operation Executed: Action={}, Table={}, SQL={}", 
                request.type(), request.from(), modRequest.getPayload());
        Map<String, Object> result = queryExecutionService.execute(request, true);

        modRequest.setStatus("APPROVED");
        modRequest.setReviewedBy(admin);
        modRequest.setReviewedAt(LocalDateTime.now());
        modRequest.setExecutionResult(objectMapper.writeValueAsString(result));

        return repository.save(modRequest);
    }

    public ModificationRequest rejectRequest(Long requestId, String adminEmail) {
        ModificationRequest modRequest = repository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Request not found"));

        if (!"PENDING".equals(modRequest.getStatus())) {
            throw new IllegalStateException("Request is already " + modRequest.getStatus());
        }

        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new IllegalArgumentException("Admin not found"));

        modRequest.setStatus("REJECTED");
        modRequest.setReviewedBy(admin);
        modRequest.setReviewedAt(LocalDateTime.now());

        return repository.save(modRequest);
    }
}

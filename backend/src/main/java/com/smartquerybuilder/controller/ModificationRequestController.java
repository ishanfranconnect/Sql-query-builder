package com.smartquerybuilder.controller;

import com.smartquerybuilder.dto.QueryBuilderRequest;
import com.smartquerybuilder.entity.ModificationRequest;
import com.smartquerybuilder.service.ModificationRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ModificationRequestController {

    private final ModificationRequestService service;

    // 1. Submit Query Request (User)
    @PostMapping("/query-request")
    public ModificationRequest create(@RequestBody QueryBuilderRequest request, Authentication auth) throws Exception {
        return service.createRequest(auth.getName(), request);
    }

    // 2. Get Pending Requests (Admin)
    @GetMapping("/admin/pending-queries")
    @PreAuthorize("hasRole('ADMIN')")
    public List<ModificationRequest> getPending() {
        // For simplicity, returning all. Usually would filter for status = PENDING
        return service.getAllRequests();
    }

    // 3. Approve Query (Admin)
    @PostMapping("/admin/approve/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ModificationRequest approve(@PathVariable Long id, Authentication auth) throws Exception {
        return service.approveRequest(id, auth.getName());
    }

    // 4. Reject Query (Admin)
    @PostMapping("/admin/reject/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ModificationRequest reject(@PathVariable Long id, Authentication auth) {
        return service.rejectRequest(id, auth.getName());
    }

    @GetMapping("/requests/my")
    public List<ModificationRequest> getMyRequests(Authentication auth) {
        return service.getMyRequests(auth.getName());
    }
}

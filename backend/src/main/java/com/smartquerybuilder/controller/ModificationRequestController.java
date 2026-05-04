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
@RequestMapping("/api/requests")
@RequiredArgsConstructor
public class ModificationRequestController {

    private final ModificationRequestService service;

    @PostMapping
    public ModificationRequest create(@RequestBody QueryBuilderRequest request, Authentication auth) throws Exception {
        return service.createRequest(auth.getName(), request);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<ModificationRequest> getAll() {
        return service.getAllRequests();
    }

    @GetMapping("/my")
    public List<ModificationRequest> getMyRequests(Authentication auth) {
        return service.getMyRequests(auth.getName());
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ModificationRequest approve(@PathVariable Long id, Authentication auth) throws Exception {
        return service.approveRequest(id, auth.getName());
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ModificationRequest reject(@PathVariable Long id, Authentication auth) {
        return service.rejectRequest(id, auth.getName());
    }
}

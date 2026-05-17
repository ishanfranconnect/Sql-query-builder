package com.smartquerybuilder.controller;

import com.smartquerybuilder.dto.QueryBuilderRequest;
import com.smartquerybuilder.dto.SavedQueryRequest;
import com.smartquerybuilder.service.QueryBuilderService;
import com.smartquerybuilder.service.QueryExecutionService;
import com.smartquerybuilder.service.SavedQueryService;
import com.smartquerybuilder.service.ModificationRequestService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/queries")
@RequiredArgsConstructor
public class QueryController {

    private final QueryBuilderService queryBuilderService;
    private final QueryExecutionService queryExecutionService;
    private final SavedQueryService savedQueryService;
    private final ModificationRequestService modificationRequestService;
    private final ObjectMapper objectMapper;

    @PostMapping("/generate")
    public Map<String, String> generate(@RequestBody QueryBuilderRequest request) {
        return Map.of("sql", queryBuilderService.generateSql(request));
    }

    @PostMapping("/execute")
    public Map<String, Object> execute(@RequestBody QueryBuilderRequest request, Authentication auth) throws Exception {
        String type = request.type() == null ? "SELECT" : request.type().toUpperCase();
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        
        if (!"SELECT".equals(type)) {
            modificationRequestService.createRequest(auth.getName(), request);
            return Map.of(
                "message", "Action requested for admin approval. Please check the Requests dashboard.",
                "status", "PENDING",
                "sql", queryBuilderService.generateSql(request)
            );
        }
        return queryExecutionService.execute(request, isAdmin);
    }

    @PostMapping("/save")
    public Object save(@RequestBody Map<String, Object> payload, Authentication auth) throws Exception {
        String name = String.valueOf(payload.get("name"));
        Object query = payload.get("query");
        String queryJson = objectMapper.writeValueAsString(query);
        String sql = queryBuilderService.generateSql(objectMapper.convertValue(query, QueryBuilderRequest.class));
        return savedQueryService.save(auth.getName(), new SavedQueryRequest(name, queryJson), sql);
    }

    @GetMapping
    public Object list(Authentication auth) {
        return savedQueryService.list(auth.getName());
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        savedQueryService.delete(id);
    }
}

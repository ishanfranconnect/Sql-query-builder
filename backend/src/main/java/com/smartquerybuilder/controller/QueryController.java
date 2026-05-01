package com.smartquerybuilder.controller;

import com.smartquerybuilder.dto.QueryBuilderRequest;
import com.smartquerybuilder.dto.SavedQueryRequest;
import com.smartquerybuilder.service.QueryBuilderService;
import com.smartquerybuilder.service.QueryExecutionService;
import com.smartquerybuilder.service.SavedQueryService;
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
    private final ObjectMapper objectMapper;

    @PostMapping("/generate")
    public Map<String, String> generate(@RequestBody QueryBuilderRequest request) {
        return Map.of("sql", queryBuilderService.generateSql(request));
    }

    @PostMapping("/execute")
    public Map<String, Object> execute(@RequestBody QueryBuilderRequest request) {
        return queryExecutionService.execute(request);
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

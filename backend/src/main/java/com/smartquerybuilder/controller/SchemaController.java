package com.smartquerybuilder.controller;

import com.smartquerybuilder.dto.CreateTableRequest;
import com.smartquerybuilder.service.CreateTableService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/schema")
@RequiredArgsConstructor
public class SchemaController {

    private final CreateTableService createTableService;

    @PostMapping("/tables")
    public Map<String, Object> createTable(@Valid @RequestBody CreateTableRequest request) {
        return createTableService.createTable(request);
    }
}

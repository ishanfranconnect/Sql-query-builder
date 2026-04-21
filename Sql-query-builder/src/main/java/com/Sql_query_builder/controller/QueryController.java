package com.Sql_query_builder.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.Sql_query_builder.model.QueryRequest;
import com.Sql_query_builder.service.ValidationService;

@RestController
@RequestMapping("/query")
public class QueryController {
    @Autowired
    private ValidationService validationService;

    @PostMapping
    public String validateQuery(@RequestBody QueryRequest request){
        validationService.validate(request);
        return "Validation passed";
    }
}

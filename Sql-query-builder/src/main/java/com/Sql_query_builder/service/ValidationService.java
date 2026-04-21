package com.Sql_query_builder.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.Sql_query_builder.model.QueryRequest;

@Service
public class ValidationService {
    private static final List<String> ALLOWED_OPERATIONS =List.of("SELECT","DELETE");
    private static final List<String> ALLOWED_OPERATORS =List.of("=", ">", "<", "IN");
    public void validate(QueryRequest request){
        if(!ALLOWED_OPERATIONS.contains(request.getOperation().toUpperCase())){
            throw new RuntimeException("Invalid operation");
        }
        if("DELETE".equalsIgnoreCase(request.getOperation())&&(request.getFilters()==null || request.getFilters().isEmpty())){
            throw new RuntimeException("DELETE must have where Clause");
        }
        // if the filter part is not given by the user then it give the NULL pointer exception so handling the null pointer exception
        if(request.getFilters()!=null){
            request.getFilters().forEach(f->{
                if(!ALLOWED_OPERATORS.contains(f.getOperator().toUpperCase())){
                    throw new RuntimeException("Invalid operator");
                }
            });
        }
    }

}

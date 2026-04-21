package com.Sql_query_builder.model;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QueryRequest {
    private String operation;
    private String database;
    private String table;
    private List<String> columns;
    private List<Condition>filters;
}

package com.Sql_query_builder.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Condition {
    private String field;
    private String operator;
    private String value;
    private String logicalOperator;

}

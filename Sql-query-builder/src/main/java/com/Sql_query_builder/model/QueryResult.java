package com.Sql_query_builder.model;

import java.util.List;

public class QueryResult {
    private String query;
    private List<Object> params;

    public QueryResult(String query, List<Object> params) {
        this.query = query;
        this.params = params;
    }
    public String getQuery(){
        return query;
    }
    public List<Object> getParams(){
        return params;
    }

}

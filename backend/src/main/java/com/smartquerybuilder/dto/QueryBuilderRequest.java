package com.smartquerybuilder.dto;

import java.util.List;
import java.util.Map;

public record QueryBuilderRequest(
        String type,
        List<String> select,
        String from,
        Map<String, Object> values,
        List<Map<String, Object>> joins,
        List<Map<String, Object>> where,
        List<String> groupBy,
        List<Map<String, Object>> having,
        List<Map<String, Object>> orderBy,
        Integer limit,
        Integer offset,
        Boolean distinct
) {}

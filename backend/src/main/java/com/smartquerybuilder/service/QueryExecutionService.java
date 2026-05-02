package com.smartquerybuilder.service;

import com.smartquerybuilder.dto.QueryBuilderRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class QueryExecutionService {

    private final QueryBuilderService queryBuilderService;
    private final JdbcTemplate jdbcTemplate;

    public Map<String, Object> execute(QueryBuilderRequest request) {
        String sql = queryBuilderService.generateSql(request);
        blockDestructiveSql(sql);
        String type = request.type() == null ? "SELECT" : request.type().toUpperCase();
        
        List<Object> paramsList = new ArrayList<>();
        if (request.values() != null) {
            paramsList.addAll(request.values().values());
        }
        paramsList.addAll(extractParams(request.where(), request.having()));
        Object[] params = paramsList.toArray();

        if ("SELECT".equals(type)) {
            List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql, params);
            return Map.of("sql", sql, "count", rows.size(), "rows", rows);
        } else {
            int affected = jdbcTemplate.update(sql, params);
            return Map.of("sql", sql, "affectedRows", affected);
        }
    }

    private List<Object> extractParams(List<Map<String, Object>>... conditionGroups) {
        List<Object> params = new ArrayList<>();
        for (List<Map<String, Object>> group : conditionGroups) {
            if (group == null) continue;
            for (Map<String, Object> condition : group) {
                params.add(condition.get("value"));
            }
        }
        return params;
    }

    private void blockDestructiveSql(String sql) {
        String normalized = sql.toUpperCase();
        if (normalized.contains(" DROP ") || normalized.startsWith("DROP ")) {
            throw new IllegalArgumentException("DROP queries are blocked");
        }
    }
}

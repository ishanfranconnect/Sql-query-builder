package com.smartquerybuilder.service;

import com.smartquerybuilder.dto.QueryBuilderRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

@Service
public class QueryBuilderService {

    private static final Pattern SAFE_IDENTIFIER = Pattern.compile("^[a-zA-Z_*][a-zA-Z0-9_\\.\\s\\(\\)\\,*]*$", Pattern.CASE_INSENSITIVE);
    private static final Set<String> SAFE_OPERATORS = Set.of("=", ">", "<", ">=", "<=", "<>", "LIKE", "BETWEEN", "IN");

    public String generateSql(QueryBuilderRequest ir) {
        validateIdentifier(ir.from());
        String type = ir.type() == null ? "SELECT" : ir.type().toUpperCase();

        switch (type) {
            case "INSERT":
                return generateInsertSql(ir);
            case "UPDATE":
                return generateUpdateSql(ir);
            case "DELETE":
                return generateDeleteSql(ir);
            default:
                return generateSelectSql(ir);
        }
    }

    private String generateSelectSql(QueryBuilderRequest ir) {
        StringBuilder sql = new StringBuilder("SELECT ");
        if (Boolean.TRUE.equals(ir.distinct())) sql.append("DISTINCT ");
        
        if (ir.select() == null || ir.select().isEmpty()) {
            sql.append("*");
        } else {
            ir.select().forEach(this::validateIdentifier);
            sql.append(String.join(", ", ir.select()));
        }
        
        sql.append(" FROM ").append(ir.from());

        appendJoins(sql, ir.joins());
        appendConditions(sql, " WHERE ", ir.where());
        appendGroupBy(sql, ir.groupBy());
        appendConditions(sql, " HAVING ", ir.having());
        appendOrderBy(sql, ir.orderBy());
        if (ir.limit() != null && ir.limit() > 0) sql.append(" LIMIT ").append(ir.limit());
        if (ir.offset() != null && ir.offset() >= 0) sql.append(" OFFSET ").append(ir.offset());
        return sql.toString();
    }

    private String generateInsertSql(QueryBuilderRequest ir) {
        StringBuilder sql = new StringBuilder("INSERT INTO ").append(ir.from());
        if (ir.values() == null || ir.values().isEmpty()) {
            throw new IllegalArgumentException("INSERT requires values");
        }
        sql.append(" (").append(String.join(", ", ir.values().keySet())).append(")");
        sql.append(" VALUES (");
        for (int i = 0; i < ir.values().size(); i++) {
            sql.append("?");
            if (i < ir.values().size() - 1) sql.append(", ");
        }
        sql.append(")");
        return sql.toString();
    }

    private String generateUpdateSql(QueryBuilderRequest ir) {
        StringBuilder sql = new StringBuilder("UPDATE ").append(ir.from()).append(" SET ");
        if (ir.values() == null || ir.values().isEmpty()) {
            throw new IllegalArgumentException("UPDATE requires values");
        }
        int i = 0;
        for (String key : ir.values().keySet()) {
            validateIdentifier(key);
            sql.append(key).append(" = ?");
            if (i < ir.values().size() - 1) sql.append(", ");
            i++;
        }
        appendConditions(sql, " WHERE ", ir.where());
        return sql.toString();
    }

    private String generateDeleteSql(QueryBuilderRequest ir) {
        StringBuilder sql = new StringBuilder("DELETE FROM ").append(ir.from());
        appendConditions(sql, " WHERE ", ir.where());
        return sql.toString();
    }

    public void validateIdentifier(String value) {
        if (value == null || !SAFE_IDENTIFIER.matcher(value).matches()) {
            throw new IllegalArgumentException("Unsafe table/column identifier: " + value);
        }
    }

    private void appendJoins(StringBuilder sql, List<Map<String, Object>> joins) {
        if (joins == null) return;
        for (Map<String, Object> join : joins) {
            String type = String.valueOf(join.getOrDefault("type", "INNER")).toUpperCase();
            String table = String.valueOf(join.get("table"));
            String on = String.valueOf(join.get("on"));
            validateIdentifier(table);
            sql.append(" ").append(type).append(" JOIN ").append(table).append(" ON ").append(on);
        }
    }

    private void appendConditions(StringBuilder sql, String prefix, List<Map<String, Object>> conditions) {
        if (conditions == null || conditions.isEmpty()) return;
        sql.append(prefix);
        for (int i = 0; i < conditions.size(); i++) {
            Map<String, Object> c = conditions.get(i);
            String field = String.valueOf(c.get("field"));
            String operator = String.valueOf(c.get("operator")).toUpperCase();
            validateIdentifier(field);
            if (!SAFE_OPERATORS.contains(operator)) {
                throw new IllegalArgumentException("Unsafe operator: " + operator);
            }
            sql.append(field).append(" ").append(operator).append(" ?");
            if (i < conditions.size() - 1) sql.append(" AND ");
        }
    }

    private void appendGroupBy(StringBuilder sql, List<String> groupBy) {
        if (groupBy == null || groupBy.isEmpty()) return;
        groupBy.forEach(this::validateIdentifier);
        sql.append(" GROUP BY ").append(String.join(", ", groupBy));
    }

    private void appendOrderBy(StringBuilder sql, List<Map<String, Object>> orderBy) {
        if (orderBy == null || orderBy.isEmpty()) return;
        sql.append(" ORDER BY ");
        for (int i = 0; i < orderBy.size(); i++) {
            Map<String, Object> o = orderBy.get(i);
            String field = String.valueOf(o.get("field"));
            String direction = String.valueOf(o.getOrDefault("direction", "ASC")).toUpperCase();
            validateIdentifier(field);
            sql.append(field).append(" ").append(direction.equals("DESC") ? "DESC" : "ASC");
            if (i < orderBy.size() - 1) sql.append(", ");
        }
    }
}

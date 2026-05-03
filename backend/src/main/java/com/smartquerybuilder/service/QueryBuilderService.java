package com.smartquerybuilder.service;

import com.smartquerybuilder.dto.QueryBuilderRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

@Service
public class QueryBuilderService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public List<String> getColumns(String table) {
        return jdbcTemplate.queryForList("SELECT column_name FROM information_schema.columns WHERE table_name = ? AND table_schema = 'smart_query_builder' ORDER BY ordinal_position", String.class, table);
    }

    private String generateAlias(String table) {
        return table.substring(0, 1).toLowerCase();
    }

    private static final Pattern SAFE_IDENTIFIER = Pattern.compile("^[a-zA-Z_*][a-zA-Z0-9_\\.\\s\\(\\)\\,*]*$", Pattern.CASE_INSENSITIVE);
    /** Operators ordered longest-first; {@code ==} is accepted then normalized to {@code =} for SQL. */
    private static final Pattern SAFE_JOIN_ON = Pattern.compile(
            "^([a-zA-Z0-9_.]+\\s*(<=|>=|<>|==|=|<|>)\\s*[a-zA-Z0-9_.]+)(\\s+AND\\s+[a-zA-Z0-9_.]+\\s*(<=|>=|<>|==|=|<|>)\\s*[a-zA-Z0-9_.]+)*$",
            Pattern.CASE_INSENSITIVE);
    private static final Set<String> SAFE_JOIN_TYPES = Set.of(
            "INNER", "LEFT", "RIGHT", "FULL",
            "LEFT OUTER", "RIGHT OUTER", "FULL OUTER",
            "CROSS");
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
        
        // Handle table aliases for joins to avoid column conflicts
        Map<String, String> tableAliases = new HashMap<>();
        List<String> tables = new ArrayList<>();
        tables.add(ir.from());
        tableAliases.put(ir.from(), generateAlias(ir.from()));
        int aliasIndex = 1;
        if (ir.joins() != null) {
            for (Map<String, Object> join : ir.joins()) {
                String table = String.valueOf(join.get("table")).trim();
                tables.add(table);
                String alias = generateAlias(table);
                // Handle conflicts
                while (tableAliases.containsValue(alias)) {
                    alias = generateAlias(table) + aliasIndex;
                    aliasIndex++;
                }
                tableAliases.put(table, alias);
            }
        }
        
        if (ir.select() == null || ir.select().isEmpty()) {
            sql.append("*");
        } else if (ir.select().size() == 1 && "*".equals(ir.select().get(0)) && !ir.joins().isEmpty()) {
            // Use qualified columns with aliases to avoid conflicts
            List<String> selectParts = new ArrayList<>();
            for (Map.Entry<String, String> entry : tableAliases.entrySet()) {
                String table = entry.getKey();
                String alias = entry.getValue();
                List<String> columns = getColumns(table);
                for (String col : columns) {
                    selectParts.add(alias + "." + col + " AS " + alias + "_" + col);
                }
            }
            sql.append(String.join(", ", selectParts));
        } else {
            ir.select().forEach(this::validateIdentifier);
            sql.append(String.join(", ", ir.select()));
        }
        
        sql.append(" FROM ").append(ir.from());
        if (tableAliases.containsKey(ir.from())) {
            sql.append(" ").append(tableAliases.get(ir.from()));
        }

        appendJoins(sql, ir.joins(), tableAliases);
        appendConditions(sql, " WHERE ", ir.where(), tableAliases);
        appendGroupBy(sql, ir.groupBy(), ir.select(), tableAliases);
        appendConditions(sql, " HAVING ", ir.having(), tableAliases);
        appendOrderBy(sql, ir.orderBy(), tableAliases);
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
        appendConditions(sql, " WHERE ", ir.where(), Map.of());
        return sql.toString();
    }

    private String generateDeleteSql(QueryBuilderRequest ir) {
        StringBuilder sql = new StringBuilder("DELETE FROM ").append(ir.from());
        appendConditions(sql, " WHERE ", ir.where(), Map.of());
        return sql.toString();
    }

    public void validateIdentifier(String value) {
        if (value == null || !SAFE_IDENTIFIER.matcher(value).matches()) {
            throw new IllegalArgumentException("Unsafe table/column identifier: " + value);
        }
    }

    private void appendJoins(StringBuilder sql, List<Map<String, Object>> joins, Map<String, String> tableAliases) {
        if (joins == null) return;
        for (Map<String, Object> join : joins) {
            if (join == null) continue;
            String rawType = String.valueOf(join.getOrDefault("type", "INNER")).trim();
            String type = rawType.toUpperCase();
            if (!SAFE_JOIN_TYPES.contains(type)) {
                throw new IllegalArgumentException("Unsupported join type: " + rawType);
            }
            Object tableObj = join.get("table");
            if (tableObj == null) {
                throw new IllegalArgumentException("Join requires a table");
            }
            String table = String.valueOf(tableObj).trim();
            if (table.isEmpty() || "null".equalsIgnoreCase(table)) {
                throw new IllegalArgumentException("Join requires a table");
            }
            validateIdentifier(table);

            if ("CROSS".equals(type)) {
                sql.append(" CROSS JOIN ").append(table);
                if (tableAliases.containsKey(table)) {
                    sql.append(" ").append(tableAliases.get(table));
                }
                continue;
            }

            Object onObj = join.get("on");
            if (onObj == null) {
                throw new IllegalArgumentException(type + " JOIN requires an ON clause");
            }
            String on = String.valueOf(onObj).trim();
            if (on.isEmpty() || "null".equalsIgnoreCase(on)) {
                throw new IllegalArgumentException(type + " JOIN requires an ON clause");
            }
            // Replace table names with aliases in ON clause
            for (Map.Entry<String, String> entry : tableAliases.entrySet()) {
                on = on.replaceAll("\\b" + Pattern.quote(entry.getKey()) + "\\.", entry.getValue() + ".");
            }
            on = normalizeJoinOnAndValidate(on);
            sql.append(" ").append(type).append(" JOIN ").append(table);
            if (tableAliases.containsKey(table)) {
                sql.append(" ").append(tableAliases.get(table));
            }
            sql.append(" ON ").append(on);
        }
    }

    /** Maps {@code ==} to SQL {@code =}, then validates the ON expression. */
    private String normalizeJoinOnAndValidate(String on) {
        String n = on.trim();
        while (n.contains("==")) {
            n = n.replace("==", "=");
        }
        if (!SAFE_JOIN_ON.matcher(n).matches()) {
            throw new IllegalArgumentException(
                    "Unsafe or invalid JOIN ON (use qualified columns and SQL operators =, <>, <, >, <=, >=; "
                            + "programming-style == is converted to = automatically; combine conditions with AND)");
        }
        return n;
    }

    private String normalizeField(String field, Map<String, String> tableAliases) {
        if (field == null) return null;
        String trimmed = field.trim();
        int dotIndex = trimmed.indexOf('.');
        if (dotIndex > 0) {
            String left = trimmed.substring(0, dotIndex);
            String right = trimmed.substring(dotIndex + 1);
            if (tableAliases.containsKey(left)) {
                return tableAliases.get(left) + "." + right;
            }
        }

        int underscoreIndex = trimmed.indexOf('_');
        if (underscoreIndex > 0) {
            String alias = trimmed.substring(0, underscoreIndex);
            String column = trimmed.substring(underscoreIndex + 1);
            if (tableAliases.containsValue(alias)) {
                return alias + "." + column;
            }
        }

        return trimmed;
    }

    private void appendConditions(StringBuilder sql, String prefix, List<Map<String, Object>> conditions, Map<String, String> tableAliases) {
        if (conditions == null || conditions.isEmpty()) return;
        sql.append(prefix);
        for (int i = 0; i < conditions.size(); i++) {
            Map<String, Object> c = conditions.get(i);
            String field = normalizeField(String.valueOf(c.get("field")), tableAliases);
            String operator = String.valueOf(c.get("operator")).toUpperCase();
            validateIdentifier(field);
            if (!SAFE_OPERATORS.contains(operator)) {
                throw new IllegalArgumentException("Unsafe operator: " + operator);
            }
            sql.append(field).append(" ").append(operator).append(" ?");
            if (i < conditions.size() - 1) sql.append(" AND ");
        }
    }

    private void appendGroupBy(StringBuilder sql, List<String> groupBy, List<String> select, Map<String, String> tableAliases) {
        if (groupBy == null || groupBy.isEmpty()) return;

        Map<String, String> aliasExpressionMap = buildSelectAliasMap(select, tableAliases);
        List<String> normalized = new ArrayList<>();
        for (String field : groupBy) {
            String normalizedField = normalizeField(field, tableAliases);
            validateIdentifier(normalizedField);
            if (!normalized.contains(normalizedField)) {
                normalized.add(normalizedField);
            }
        }

        if (!hasAggregateSelect(select)) {
            if (select.size() == 1 && "*".equals(select.get(0))) {
                for (Map.Entry<String, String> entry : tableAliases.entrySet()) {
                    String table = entry.getKey();
                    String alias = entry.getValue();
                    for (String column : getColumns(table)) {
                        String aliased = alias + "." + column;
                        if (!normalized.contains(aliased)) {
                            normalized.add(aliased);
                        }
                    }
                }
            } else {
                for (String field : select) {
                    String trimmed = field.trim();
                    if (trimmed.isEmpty() || isAggregateField(trimmed)) continue;
                    String normalizedSelectField = normalizeSelectField(trimmed, tableAliases);
                    if (aliasExpressionMap.containsKey(normalizedSelectField)) {
                        normalizedSelectField = aliasExpressionMap.get(normalizedSelectField);
                    }
                    if (!normalized.contains(normalizedSelectField)) {
                        validateIdentifier(normalizedSelectField);
                        normalized.add(normalizedSelectField);
                    }
                }
            }
        }

        sql.append(" GROUP BY ").append(String.join(", ", normalized));
    }

    private Map<String, String> buildSelectAliasMap(List<String> select, Map<String, String> tableAliases) {
        Map<String, String> aliases = new HashMap<>();
        if (select == null) return aliases;
        for (String item : select) {
            if (item == null) continue;
            String trimmed = item.trim();
            String upper = trimmed.toUpperCase();
            int asIndex = upper.lastIndexOf(" AS ");
            if (asIndex > 0) {
                String expression = trimmed.substring(0, asIndex).trim();
                String alias = trimmed.substring(asIndex + 4).trim();
                if (!alias.isEmpty()) {
                    aliases.put(alias, normalizeField(expression, tableAliases));
                }
            }
        }
        return aliases;
    }

    private String normalizeSelectField(String field, Map<String, String> tableAliases) {
        String upper = field.toUpperCase();
        int asIndex = upper.lastIndexOf(" AS ");
        if (asIndex > 0) {
            return field.substring(asIndex + 4).trim();
        }
        return normalizeField(field, tableAliases);
    }

    private boolean hasAggregateSelect(List<String> select) {
        if (select == null || select.isEmpty()) return false;
        for (String item : select) {
            if (isAggregateField(item)) {
                return true;
            }
        }
        return false;
    }

    private boolean isAggregateField(String field) {
        if (field == null) return false;
        String normalized = field.trim().toUpperCase();
        return normalized.startsWith("COUNT(")
                || normalized.startsWith("SUM(")
                || normalized.startsWith("AVG(")
                || normalized.startsWith("MIN(")
                || normalized.startsWith("MAX(")
                || normalized.startsWith("STDDEV(")
                || normalized.startsWith("VARIANCE(");
    }

    private void appendOrderBy(StringBuilder sql, List<Map<String, Object>> orderBy, Map<String, String> tableAliases) {
        if (orderBy == null || orderBy.isEmpty()) return;
        sql.append(" ORDER BY ");
        for (int i = 0; i < orderBy.size(); i++) {
            Map<String, Object> o = orderBy.get(i);
            String field = normalizeField(String.valueOf(o.get("field")), tableAliases);
            String direction = String.valueOf(o.getOrDefault("direction", "ASC")).toUpperCase();
            validateIdentifier(field);
            sql.append(field).append(" ").append(direction.equals("DESC") ? "DESC" : "ASC");
            if (i < orderBy.size() - 1) sql.append(", ");
        }
    }
}

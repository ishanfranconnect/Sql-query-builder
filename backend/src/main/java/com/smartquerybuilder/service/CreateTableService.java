package com.smartquerybuilder.service;

import com.smartquerybuilder.dto.CreateColumnRequest;
import com.smartquerybuilder.dto.CreateTableRequest;
import com.smartquerybuilder.entity.ColumnMetadata;
import com.smartquerybuilder.entity.TableMetadata;
import com.smartquerybuilder.repository.ColumnMetadataRepository;
import com.smartquerybuilder.repository.TableMetadataRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class CreateTableService {

    private static final Pattern IDENTIFIER = Pattern.compile("^[A-Za-z_][A-Za-z0-9_]{0,62}$");
    /**
     * Base MySQL type + optional length/precision, e.g. INT, VARCHAR(255), DECIMAL(10,2).
     * Excludes semicolons and parens with arbitrary content to reduce injection risk.
     */
    private static final Pattern DATA_TYPE = Pattern.compile(
            "^[A-Za-z][A-Za-z0-9]*(?:\\(\\s*\\d{1,5}(?:\\s*,\\s*\\d{1,5})?\\s*\\))?$");

    private final JdbcTemplate jdbcTemplate;
    private final TableMetadataRepository tableMetadataRepository;
    private final ColumnMetadataRepository columnMetadataRepository;

    public Map<String, Object> createTable(CreateTableRequest request) {
        String table = request.tableName().trim();
        validateIdentifier("tableName", table);
        if (tableMetadataRepository.existsByTableName(table) || tableExistsInDatabase(table)) {
            throw new IllegalArgumentException("A table with this name already exists");
        }

        List<CreateColumnRequest> columns = request.columns();
        long autoIncCount = columns.stream().filter(CreateColumnRequest::autoIncrement).count();
        if (autoIncCount > 1) {
            throw new IllegalArgumentException("At most one column may be AUTO_INCREMENT");
        }
        int pkCount = (int) columns.stream().filter(CreateColumnRequest::primaryKey).count();
        Set<String> seen = new HashSet<>();
        for (CreateColumnRequest c : columns) {
            String cn = c.columnName().trim();
            if (!seen.add(cn.toLowerCase())) {
                throw new IllegalArgumentException("Duplicate column name: " + cn);
            }
            if (c.autoIncrement() && !c.primaryKey()) {
                throw new IllegalArgumentException("AUTO_INCREMENT must be used with PRIMARY KEY on the same column");
            }
        }
        if (pkCount == 0) {
            throw new IllegalArgumentException("Define at least one PRIMARY KEY column");
        }

        String sql = buildCreateTableSql(table, columns, pkCount);
        jdbcTemplate.execute(sql);

        TableMetadata meta = new TableMetadata();
        meta.setTableName(table);
        meta.setDisplayName(StringUtils.hasText(request.displayName()) ? request.displayName().trim() : table);
        tableMetadataRepository.save(meta);

        for (CreateColumnRequest col : columns) {
            ColumnMetadata cm = new ColumnMetadata();
            cm.setTableName(table);
            cm.setColumnName(validateIdentifier("columnName", col.columnName().trim()));
            cm.setDataType(validateDataType(col.dataType().trim()));
            cm.setColumnConstraints(summarizeConstraints(col));
            columnMetadataRepository.save(cm);
        }

        return Map.of(
                "message", "Table created",
                "tableName", table,
                "sql", sql
        );
    }

    private boolean tableExistsInDatabase(String tableName) {
        String check = "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?";
        Integer n = jdbcTemplate.queryForObject(check, Integer.class, tableName);
        return n != null && n > 0;
    }

    private String buildCreateTableSql(String table, List<CreateColumnRequest> columns, long pkCount) {
        List<String> pkColumns = new ArrayList<>();
        List<String> parts = new ArrayList<>();
        for (CreateColumnRequest col : columns) {
            String name = validateIdentifier("columnName", col.columnName().trim());
            if (col.primaryKey()) {
                pkColumns.add(name);
            }
            StringBuilder line = new StringBuilder();
            line.append(quoteId(name)).append(" ").append(validateDataType(col.dataType().trim()));
            if (col.notNull()) {
                line.append(" NOT NULL");
            }
            if (StringUtils.hasText(col.defaultValue())) {
                line.append(" DEFAULT ").append(formatDefaultValue(col.defaultValue().trim()));
            }
            if (col.autoIncrement()) {
                line.append(" AUTO_INCREMENT");
            }
            if (col.unique() && !col.primaryKey()) {
                line.append(" UNIQUE");
            }
            if (col.primaryKey() && pkCount == 1) {
                line.append(" PRIMARY KEY");
            }
            parts.add(line.toString());
        }
        if (pkCount > 1) {
            StringBuilder pk = new StringBuilder("PRIMARY KEY (");
            for (int i = 0; i < pkColumns.size(); i++) {
                if (i > 0) {
                    pk.append(", ");
                }
                pk.append(quoteId(pkColumns.get(i)));
            }
            pk.append(")");
            parts.add(pk.toString());
        }
        return "CREATE TABLE " + quoteId(table) + " (" + String.join(", ", parts) + ") ENGINE=InnoDB";
    }

    private String summarizeConstraints(CreateColumnRequest c) {
        List<String> bits = new ArrayList<>();
        if (c.notNull()) {
            bits.add("NOT NULL");
        }
        if (c.primaryKey()) {
            bits.add("PRIMARY KEY");
        }
        if (c.unique() && !c.primaryKey()) {
            bits.add("UNIQUE");
        }
        if (c.autoIncrement()) {
            bits.add("AUTO_INCREMENT");
        }
        if (StringUtils.hasText(c.defaultValue())) {
            bits.add("DEFAULT");
        }
        return String.join(", ", bits);
    }

    private String formatDefaultValue(String raw) {
        if (raw.length() > 200) {
            throw new IllegalArgumentException("defaultValue is too long");
        }
        if (raw.contains(";") || raw.contains("--") || raw.contains("/*")) {
            throw new IllegalArgumentException("Invalid defaultValue");
        }
        String u = raw.toUpperCase();
        if ("NULL".equals(u)) {
            return "NULL";
        }
        if ("CURRENT_TIMESTAMP".equals(u) || "NOW()".equals(u)) {
            return u;
        }
        if (raw.equalsIgnoreCase("true") || raw.equalsIgnoreCase("false")) {
            return raw.equalsIgnoreCase("true") ? "1" : "0";
        }
        if (raw.matches("^-?\\d+(?:\\.\\d+)?$")) {
            return raw;
        }
        String escaped = raw.replace("'", "''");
        return "'" + escaped + "'";
    }

    private String validateIdentifier(String field, String value) {
        if (!IDENTIFIER.matcher(value).matches()) {
            throw new IllegalArgumentException("Invalid " + field + ": use letters, numbers, underscore; max 63 characters");
        }
        return value;
    }

    private String validateDataType(String value) {
        if (value.length() > 64 || !DATA_TYPE.matcher(value).matches()) {
            throw new IllegalArgumentException(
                    "Invalid dataType: use a MySQL type such as INT, BIGINT, VARCHAR(255), DECIMAL(10,2)");
        }
        return value;
    }

    private static String quoteId(String name) {
        return "`" + name.replace("`", "``") + "`";
    }
}

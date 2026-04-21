package com.Sql_query_builder.services;

import com.Sql_query_builder.utils.SqlOperatorConstants;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
public class ValidationService {

    @Autowired
    private Environment env;

    public boolean isValidOperation(String operation, String role) {

        if (operation == null || role == null) {
            return false;
        }

        // Normalize inputs
        String normalizedRole = role.trim().toUpperCase();
        String normalizedOperation = operation.trim().toUpperCase();

        // Only allow known roles
        if (!normalizedRole.equals("ADMIN") && !normalizedRole.equals("USER")) {
            return false;
        }

        // Build property key
        String key = "whitelist." + normalizedRole + ".operations";

        String value = env.getProperty(key);

        if (value == null || value.isEmpty()) {
            return false;
        }

        // Split and validate
        return Arrays.stream(value.split(","))
                .map(String::trim)
                .anyMatch(op -> op.equalsIgnoreCase(normalizedOperation));
    }

    public boolean isValidOperator(String operator) {

        if (operator == null || operator.trim().isEmpty()) {
            return false;
        }

        String normalized = operator.trim().toUpperCase();

        return SqlOperatorConstants.ALLOWED_OPERATORS.contains(normalized);
    }

    public boolean isValidTable(String table, String role) {

        if (table == null || role == null) {
            return false;
        }

        String normalizedTable = table.trim().toLowerCase();
        String normalizedRole = role.trim().toUpperCase();

        // Build key
        String key = "whitelist." + normalizedRole + ".tables";

        String allowedTables = env.getProperty(key);

        if (allowedTables == null || allowedTables.isEmpty()) {
            return false;
        }

        return Arrays.stream(allowedTables.split(","))
                .map(String::trim)
                .anyMatch(t -> t.equalsIgnoreCase(normalizedTable));
    }
}

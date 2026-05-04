package com.smartquerybuilder.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateColumnRequest(
        @NotBlank(message = "columnName is required") String columnName,
        @NotBlank(message = "dataType is required") String dataType,
        boolean notNull,
        boolean primaryKey,
        boolean unique,
        boolean autoIncrement,
        String defaultValue
) {
}

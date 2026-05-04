package com.smartquerybuilder.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record CreateTableRequest(
        @NotBlank(message = "tableName is required") String tableName,
        String displayName,
        @NotEmpty(message = "At least one column is required") @Valid List<CreateColumnRequest> columns
) {
}

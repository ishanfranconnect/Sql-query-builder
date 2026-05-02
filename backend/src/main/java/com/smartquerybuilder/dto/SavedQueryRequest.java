package com.smartquerybuilder.dto;

import jakarta.validation.constraints.NotBlank;

public record SavedQueryRequest(@NotBlank String name, @NotBlank String queryJson) {}

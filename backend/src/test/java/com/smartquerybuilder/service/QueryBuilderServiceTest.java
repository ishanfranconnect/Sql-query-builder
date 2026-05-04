package com.smartquerybuilder.service;

import com.smartquerybuilder.dto.QueryBuilderRequest;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class QueryBuilderServiceTest {

    private final QueryBuilderService service = new QueryBuilderService();

    @Test
    void joinOn_doubleEquals_normalizedToSqlEquals() {
        QueryBuilderRequest req = new QueryBuilderRequest(
                "SELECT",
                List.of("*"),
                "users",
                null,
                List.of(Map.of(
                        "type", "INNER",
                        "table", "roles",
                        "on", "roles.id==users.role")),
                List.of(),
                null,
                null,
                null,
                null,
                null,
                false);
        String sql = service.generateSql(req);
        assertTrue(sql.contains("ON roles.id=users.role"), sql);
        assertFalse(sql.contains("=="), sql);
    }

    @Test
    void joinOn_validUsersRolesViaUserRoles_executesShape() {
        QueryBuilderRequest req = new QueryBuilderRequest(
                "SELECT",
                List.of("*"),
                "users",
                null,
                List.of(
                        Map.of("type", "INNER", "table", "user_roles", "on", "user_roles.user_id == users.id"),
                        Map.of("type", "INNER", "table", "roles", "on", "roles.id == user_roles.role_id")),
                List.of(),
                null,
                null,
                null,
                null,
                null,
                false);
        String sql = service.generateSql(req);
        assertTrue(sql.contains("INNER JOIN user_roles ON user_roles.user_id = users.id"), sql);
        assertTrue(sql.contains("INNER JOIN roles ON roles.id = user_roles.role_id"), sql);
    }

    @Test
    void joinOn_singleEquals_accepted() {
        QueryBuilderRequest req = new QueryBuilderRequest(
                "SELECT",
                List.of("*"),
                "users",
                null,
                List.of(Map.of("type", "INNER", "table", "roles", "on", "roles.id = users.role")),
                List.of(),
                null,
                null,
                null,
                null,
                null,
                false);
        assertDoesNotThrow(() -> service.generateSql(req));
    }
}

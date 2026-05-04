package com.smartquerybuilder;

import com.smartquerybuilder.dto.QueryBuilderRequest;
import com.smartquerybuilder.service.QueryBuilderService;
import org.springframework.jdbc.core.JdbcTemplate;
import java.util.*;

public class TestSQLGen {
    public static void main(String[] args) {
        QueryBuilderService service = new QueryBuilderService() {
            @Override
            public List<String> getColumns(String table) {
                return Arrays.asList("customer_id", "name");
            }
        };

        QueryBuilderRequest req = new QueryBuilderRequest(
            "SELECT",
            Arrays.asList("customers.customer_id", "SUM(order_items.price) as oi_total", "MAX(order_items.price) as mx"),
            "customers",
            null,
            Arrays.asList(
                Map.of("type", "INNER", "table", "orders", "on", "orders.customer_id=customers.customer_id"),
                Map.of("type", "INNER", "table", "order_items", "on", "order_items.order_id=orders.order_id")
            ),
            null,
            Arrays.asList("customers.customer_id"),
            null,
            Arrays.asList(Map.of("field", "mx", "direction", "DESC")),
            null,
            null,
            false
        );

        String sql = service.generateSql(req);
        System.out.println("Generated SQL: " + sql);
    }
}

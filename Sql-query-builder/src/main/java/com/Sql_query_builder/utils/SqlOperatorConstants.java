package com.Sql_query_builder.utils;

import java.util.Set;

public class SqlOperatorConstants {
        public static final Set<String> ALLOWED_OPERATORS = Set.of(
                "=", ">", "<", ">=", "<=",
                "LIKE", "IN", "NOT IN", "!="
        );

}

package com.Sql_query_builder;

import com.Sql_query_builder.services.ValidationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationContext;

@SpringBootApplication
public class SqlQueryBuilderApplication {



	public static void main(String[] args) {
        ApplicationContext context=SpringApplication.run(SqlQueryBuilderApplication.class, args);

        ValidationService service=context.getBean(ValidationService.class);

        System.out.println(service.isValidOperator("not"));

	}


}

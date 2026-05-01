package com.smartquerybuilder.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "columns_metadata")
@Getter
@Setter
public class ColumnMetadata {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String tableName;
    @Column(nullable = false)
    private String columnName;
    @Column(nullable = false)
    private String dataType;
}

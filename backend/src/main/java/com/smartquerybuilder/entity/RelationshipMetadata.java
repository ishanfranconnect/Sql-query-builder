package com.smartquerybuilder.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "relationships_metadata")
@Getter
@Setter
public class RelationshipMetadata {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String fromTable;
    private String fromColumn;
    private String toTable;
    private String toColumn;
    private String joinType;
}

package com.smartquerybuilder.repository;

import com.smartquerybuilder.entity.TableMetadata;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TableMetadataRepository extends JpaRepository<TableMetadata, Long> {
    boolean existsByTableName(String tableName);

    Optional<TableMetadata> findByTableName(String tableName);
}

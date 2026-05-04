package com.smartquerybuilder.repository;

import com.smartquerybuilder.entity.ColumnMetadata;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ColumnMetadataRepository extends JpaRepository<ColumnMetadata, Long> {
    List<ColumnMetadata> findByTableNameOrderByIdAsc(String tableName);
}

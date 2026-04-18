package com.prescan.repository;

import com.prescan.model.ScanTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScanTaskRepository extends JpaRepository<ScanTask, Long> {
    List<ScanTask> findAllByOrderByScanTimestampDesc();
}

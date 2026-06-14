package com.campussync;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Entry point for the CampusSync backend.
 * @EnableScheduling turns on the background job that expires stale listings.
 */
@SpringBootApplication
@EnableScheduling
public class CampusSyncApplication {

    public static void main(String[] args) {
        SpringApplication.run(CampusSyncApplication.class, args);
    }
}

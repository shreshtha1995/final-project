package com.campussync.controller;

import com.campussync.dto.admin.AddDirectoryIdRequest;
import com.campussync.dto.admin.DirectoryEntryResponse;
import com.campussync.dto.admin.UserSummaryResponse;
import com.campussync.service.AdminService;
import com.campussync.service.ListingCleanupScheduler;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/** Super Admin endpoints. Secured to ROLE_SUPER_ADMIN in SecurityConfig. */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;
    private final ListingCleanupScheduler lifecycleJob;

    public AdminController(AdminService adminService, ListingCleanupScheduler lifecycleJob) {
        this.adminService = adminService;
        this.lifecycleJob = lifecycleJob;
    }

    /** View all valid Cognizant IDs and whether each has been used. */
    @GetMapping("/directory")
    public List<DirectoryEntryResponse> directory() {
        return adminService.listDirectory();
    }

    /** Add a new valid Cognizant ID to the directory. */
    @PostMapping("/directory")
    public DirectoryEntryResponse addId(@Valid @RequestBody AddDirectoryIdRequest request) {
        return adminService.addId(request);
    }

    /** Remove an unused Cognizant ID from the directory. */
    @DeleteMapping("/directory/{id}")
    public Map<String, String> deleteId(@PathVariable Long id) {
        adminService.deleteId(id);
        return Map.of("status", "deleted");
    }

    /** All registered users. */
    @GetMapping("/users")
    public List<UserSummaryResponse> users() {
        return adminService.listUsers();
    }

    /** Delete any user (and all their data); frees their Cognizant ID. */
    @DeleteMapping("/users/{id}")
    public Map<String, String> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return Map.of("status", "deleted");
    }

    /** Manually run the listing lifecycle job (reminders + expiry) — handy for demos/testing. */
    @PostMapping("/run-expiry-job")
    public Map<String, String> runExpiryJob() {
        lifecycleJob.runLifecycleJob();
        return Map.of("status", "lifecycle job executed");
    }
}

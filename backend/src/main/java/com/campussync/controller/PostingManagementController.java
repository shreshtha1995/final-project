package com.campussync.controller;

import com.campussync.dto.posting.CreatePostingRequest;
import com.campussync.dto.posting.PostingResponse;
import com.campussync.service.PostingManagementService;
import com.campussync.service.PostingSupport;
import com.campussync.service.storage.ImageStorage;
import jakarta.validation.Valid;
import org.springframework.security.access.method.P;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/postings")//describe the endpoint for list a room page
public class PostingManagementController {

    private final PostingManagementService postingManagementService;
    private final ImageStorage imageStorage;


    public PostingManagementController(PostingManagementService postingManagementService, ImageStorage imageStorage) {
        this.postingManagementService = postingManagementService;
        this.imageStorage = imageStorage;
    }

    //constructor injection to inject service object


    @PostMapping("/upload-images")
    public Map<String, List<String>> uploadImages(@RequestParam("files") MultipartFile[] files) {
        return Map.of("urls", imageStorage.storeAll(files));
    }

    //create listing page will come at this endpoint
    //this will return posting response
    //if request not valid according to dto, MethodArgumentNotValidException is thrown and create posting never called
    @PostMapping
    public PostingResponse createPosting(@Valid @RequestBody CreatePostingRequest posting){
        return postingManagementService.create(posting);

    }
    //to edit a listing

    @PostMapping("/{id}")
    public PostingResponse editPosting(@PathVariable Long id, @Valid @RequestBody CreatePostingRequest request){
        return postingManagementService.update(id,request);
    }

    //to reconfirm that posting is still available at 7th day
    @PostMapping("/{id}/confirm")
    public PostingResponse reconfirmPosting(@PathVariable Long id){
        return postingManagementService.confirmStillAvailable(id);
    }





}

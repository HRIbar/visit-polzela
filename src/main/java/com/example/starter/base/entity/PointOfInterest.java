package com.example.starter.base.entity;

public class PointOfInterest {
    private String name;
    private String description;
    private String imageUrl;
    private String mapUrl;

    public PointOfInterest(String name, String description, String imageUrl, String mapUrl) {
        this.name = name;
        this.description = description;
        this.imageUrl = imageUrl;
        this.mapUrl = mapUrl;
    }

    // Getters
    public String getName() { return name; }
    public String getDescription() { return description; }
    public String getImageUrl() { return imageUrl; }
    public String getMapUrl() { return mapUrl; }
}
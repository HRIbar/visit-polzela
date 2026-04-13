package com.example.starter.base.entity;

public class PointOfInterest {

    private String name;
    private String displayName;
    private String description;
    private String imagePath;
    private String mapUrl;
    private String navigationUrl;
    private String appleNavigationUrl;

    public PointOfInterest(String name, String displayName, String description, String imagePath, String mapUrl, String navigationUrl, String appleNavigationUrl) {
        this.name = name;
        this.displayName = displayName;
        this.description = description;
        this.imagePath = imagePath;
        this.mapUrl = mapUrl;
        this.navigationUrl = navigationUrl;
        this.appleNavigationUrl = appleNavigationUrl;
    }

    public PointOfInterest() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getImagePath() { return imagePath; }
    public void setImagePath(String imagePath) { this.imagePath = imagePath; }

    public String getMapUrl() { return mapUrl; }
    public void setMapUrl(String mapUrl) { this.mapUrl = mapUrl; }

    public String getNavigationUrl() { return navigationUrl; }
    public void setNavigationUrl(String navigationUrl) { this.navigationUrl = navigationUrl; }

    public String getAppleNavigationUrl() { return appleNavigationUrl; }
    public void setAppleNavigationUrl(String appleNavigationUrl) { this.appleNavigationUrl = appleNavigationUrl; }
}
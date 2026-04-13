package com.example.starter.base.dto;

public class POIDto {

    public String name;
    public String displayName;
    public String shortDescription;
    public String description;
    public String imagePath;
    public int order;
    public String mapUrl;
    public String navigationUrl;
    public String appleNavigationUrl;

    public POIDto() {}

    public POIDto(String name, String displayName, String shortDescription, String description,
                  String imagePath, int order, String mapUrl, String navigationUrl, String appleNavigationUrl) {
        this.name = name;
        this.displayName = displayName;
        this.shortDescription = shortDescription;
        this.description = description;
        this.imagePath = imagePath;
        this.order = order;
        this.mapUrl = mapUrl;
        this.navigationUrl = navigationUrl;
        this.appleNavigationUrl = appleNavigationUrl;
    }
}


package com.example.starter.base.dto;

import java.util.List;

public class POIImagesDto {

    public String poiName;
    public List<String> imageUrls;

    public POIImagesDto() {}

    public POIImagesDto(String poiName, List<String> imageUrls) {
        this.poiName = poiName;
        this.imageUrls = imageUrls;
    }
}


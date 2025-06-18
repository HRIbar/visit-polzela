package com.example.starter.base.entity;

import com.vaadin.flow.server.StreamResource;

import java.io.File;
import java.io.InputStream;
import java.net.URL;

public class PointOfInterest {

    private String name;
    private String displayName;
    private String description;
    private String imagePath;
    private String mapUrl;
    String navigationUrl;

    public PointOfInterest(String name, String displayName, String description, String imagePath, String mapUrl, String navigationUrl) {
        this.name = name;
        this.displayName = displayName;
        this.description = description;
        this.imagePath = imagePath;
        this.mapUrl = mapUrl;
        this.navigationUrl = navigationUrl;
    }



    // Getters


    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDisplayName() { return displayName; }
    public String getDescription() { return description; }
    public StreamResource getImageResource() {
        return new StreamResource(getDisplayName(), () -> {
            String fullPath = "/images/" + imagePath;
            System.out.println("Attempting to load resource from: " + fullPath);
            InputStream inputStream = getClass().getResourceAsStream("/META-INF/resources" + fullPath);
            if (inputStream == null) {
                System.out.println("Resource not found: " + fullPath);
                listResources("META-INF/resources");
            }
            return inputStream;
        });
    }
    public String getMapUrl() { return mapUrl; }

    private void listResources(String path) {
        try {
            URL resourceUrl = Thread.currentThread().getContextClassLoader().getResource(path);
            if (resourceUrl != null) {
                File file = new File(resourceUrl.toURI());
                if (file.isDirectory()) {
                    System.out.println("Contents of " + path + ":");
                    for (String fileName : file.list()) {
                        System.out.println(fileName);
                    }
                }
            } else {
                System.out.println("Resource directory not found: " + path);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public String getImagePath() {
        return imagePath;
    }

    public void setImagePath(String imagePath) {
        this.imagePath = imagePath;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setMapUrl(String mapUrl) {
        this.mapUrl = mapUrl;
    }

    public String getNavigationUrl() {
        return navigationUrl;
    }

    public void setNavigationUrl(String navigationUrl) {
        this.navigationUrl = navigationUrl;
    }
}
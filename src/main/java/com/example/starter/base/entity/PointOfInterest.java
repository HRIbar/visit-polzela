package com.example.starter.base.entity;

import com.vaadin.flow.server.StreamResource;

import java.io.File;
import java.io.InputStream;
import java.net.URL;

public class PointOfInterest {
    private String name;
    private String description;
    private String imagePath;
    private String mapUrl;

    public PointOfInterest(String name, String description, String imagePath, String mapUrl) {
        this.name = name;
        this.description = description;
        this.imagePath = imagePath;
        this.mapUrl = mapUrl;
    }

    // Getters
    public String getName() { return name; }
    public String getDescription() { return description; }
    public StreamResource getImageResource() {
        return new StreamResource(getName(), () -> {
            String fullPath = "/META-INF/resources/images/" + imagePath;
            System.out.println("Attempting to load resource from: " + fullPath);
            InputStream inputStream = getClass().getResourceAsStream(fullPath);
            if (inputStream == null) {
                System.out.println("Resource not found: " + fullPath);
            }
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
}
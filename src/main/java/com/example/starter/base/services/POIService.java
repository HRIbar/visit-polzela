package com.example.starter.base.services;

import com.example.starter.base.entity.PointOfInterest;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;


@ApplicationScoped
public class POIService {

    @Inject
    private OfflineStorageService offlineStorage;

    public List<PointOfInterest> getPointsOfInterest() {
        List<PointOfInterest> pointsOfInterest = new ArrayList<>();
        String resourcePath = "/META-INF/resources/pointsofinterest/pois.txt";

        try (InputStream is = getClass().getResourceAsStream(resourcePath);
             BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8))) {

            String line;
            while ((line = reader.readLine()) != null) {
                String[] parts = line.split(";");
                if (parts.length >= 6) {
                    PointOfInterest poi = new PointOfInterest(
                            parts[0].trim(),  // name (1st argument in CSV)
                            parts[1].trim(),  // displayName (2nd argument in CSV)
                            parts[2].trim(),  // short description (3rd argument in CSV)
                            parts[0].trim() + ".webp",  // imagePath (1st argument + ".webp")
                            parts[3].trim(),  // mapUrl (4th argument in CSV)
                            parts[4].trim(),  // navigationUrl (5th argument in CSV)
                            parts[5].trim()   // appleNavigationUrl (6th argument in CSV)
                    );
                    pointsOfInterest.add(poi);
                }
            }
        } catch (IOException | NullPointerException e) {
            e.printStackTrace();
            System.err.println("Error reading points of interest from file");
        }

        return pointsOfInterest;
    }
}
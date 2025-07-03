package com.example.starter.base.services;

import com.example.starter.base.entity.PointOfInterest;
import com.vaadin.flow.component.page.PendingJavaScriptResult;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import elemental.json.JsonArray;

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

    /**
     * Gets POIs with offline support
     */
    public CompletableFuture<List<PointOfInterest>> getPOIsWithOfflineSupport() {
        CompletableFuture<List<PointOfInterest>> future = new CompletableFuture<>();

        PendingJavaScriptResult onlineCheckResult = offlineStorage.isOnline();
        if (onlineCheckResult == null) {
            // If we can't check online status, assume we're online
            List<PointOfInterest> pois = getAllPOIs();
            future.complete(pois);
            return future;
        }

        onlineCheckResult.then(Boolean.class, online -> {
            if (online) {
                // We're online, load from your normal source
                List<PointOfInterest> pois = getAllPOIs();

                // Store for offline use
                offlineStorage.storePOIs(pois);
                future.complete(pois);
            } else {
                // We're offline, try to load from IndexedDB
                PendingJavaScriptResult poisResult = offlineStorage.getPOIs();
                if (poisResult == null) {
                    future.complete(List.of());
                    return;
                }

                poisResult.then(result -> {
                    if (result instanceof JsonArray) {
                        List<PointOfInterest> pois = convertJsonArrayToPOIs((JsonArray) result);
                        future.complete(pois);
                    } else {
                        // This handles the case where the result is not a JsonArray
                        System.err.println("Error retrieving POIs from IndexedDB: unexpected result type");
                        future.complete(List.of());
                    }
                }, error -> {
                    // This handles JavaScript errors
                    System.err.println("Error retrieving POIs from IndexedDB: " + error);
                    future.complete(List.of());
                });
            }
        });

        return future;
    }

    /**
     * Converts JSON array from IndexedDB back to POI objects
     */
    private List<PointOfInterest> convertJsonArrayToPOIs(JsonArray array) {
        List<PointOfInterest> pois = new ArrayList<>();

        for (int i = 0; i < array.length(); i++) {
            elemental.json.JsonObject obj = array.getObject(i);

            PointOfInterest poi = new PointOfInterest();
            poi.setName(obj.getString("name"));
            poi.setDescription(obj.getString("description"));
            poi.setImagePath(obj.getString("mainImagePath"));
            poi.setDisplayName(obj.getString("displayName"));
            poi.setMapUrl(obj.getString("mapUrl"));
            poi.setNavigationUrl(obj.getString("navigationUrl"));
            if (obj.hasKey("appleNavigationUrl")) {
                poi.setAppleNavigationUrl(obj.getString("appleNavigationUrl"));
            }
            pois.add(poi);
        }

        return pois;
    }

    private List<PointOfInterest> getAllPOIs() {
        return getPointsOfInterest();
    }
}
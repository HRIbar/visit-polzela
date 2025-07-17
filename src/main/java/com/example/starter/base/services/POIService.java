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
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;


@ApplicationScoped
public class POIService {

    @Inject
    private OfflineStorageService offlineStorage;

    private Map<String, Map<String, String>> titlesCache = new HashMap<>();

    public List<PointOfInterest> getPointsOfInterest() {
        return getPointsOfInterest(Locale.ENGLISH); // Default to English
    }

    public List<PointOfInterest> getPointsOfInterest(Locale locale) {
        List<PointOfInterest> pointsOfInterest = new ArrayList<>();
        String resourcePath = "/META-INF/resources/pointsofinterest/pois.txt";

        // Load titles for the specified locale
        Map<String, String> localizedTitles = loadLocalizedTitles(locale);

        try (InputStream is = getClass().getResourceAsStream(resourcePath);
             BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8))) {

            String line;
            while ((line = reader.readLine()) != null) {
                String[] parts = line.split(";");
                if (parts.length >= 6) {
                    String name = parts[0].trim();
                    String displayName = localizedTitles.getOrDefault(name, parts[1].trim());

                    PointOfInterest poi = new PointOfInterest(
                            name,  // name (1st argument in CSV)
                            displayName,  // localized displayName from poititles.txt
                            parts[2].trim(),  // short description (3rd argument in CSV)
                            name + ".webp",  // imagePath (1st argument + ".webp")
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

    private Map<String, String> loadLocalizedTitles(Locale locale) {
        String languageCode = locale.getLanguage().toUpperCase();

        // Check cache first
        if (titlesCache.containsKey(languageCode)) {
            return titlesCache.get(languageCode);
        }

        Map<String, String> titles = new HashMap<>();
        String resourcePath = "/META-INF/resources/pointsofinterest/poititles.txt";

        try (InputStream is = getClass().getResourceAsStream(resourcePath);
             BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8))) {

            String line;
            while ((line = reader.readLine()) != null) {
                String[] parts = line.split(";");
                if (parts.length >= 2) {
                    String name = parts[0].trim();

                    // Find the title for the requested language
                    for (int i = 1; i < parts.length; i++) {
                        String titlePart = parts[i].trim();
                        if (titlePart.startsWith(languageCode + ":")) {
                            String title = titlePart.substring(languageCode.length() + 1);
                            titles.put(name, title);
                            break;
                        }
                    }
                }
            }
        } catch (IOException | NullPointerException e) {
            e.printStackTrace();
            System.err.println("Error reading localized titles from file");
        }

        // Cache the result
        titlesCache.put(languageCode, titles);
        return titles;
    }
}
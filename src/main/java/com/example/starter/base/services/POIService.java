package com.example.starter.base.services;

import com.example.starter.base.dto.POIDto;
import jakarta.enterprise.context.ApplicationScoped;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@ApplicationScoped
public class POIService {

    private final Map<String, Map<String, String>> titlesCache = new HashMap<>();

    /**
     * Returns all POIs with localized displayName and shortDescription.
     * The full long description is NOT included (use getLocalizedPOIDto for that).
     */
    public List<POIDto> getLocalizedPOIsDto(String lang) {
        String languageCode = lang.toUpperCase();
        Map<String, String> localizedTitles = loadLocalizedTitles(languageCode);
        List<POIDto> result = new ArrayList<>();
        String poisPath = "/META-INF/resources/pointsofinterest/pois.txt";

        try (InputStream is = getClass().getResourceAsStream(poisPath);
             BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8))) {

            String line;
            int order = 0;
            while ((line = reader.readLine()) != null) {
                line = line.trim();
                if (line.isEmpty()) continue;
                String[] parts = line.split(";");
                if (parts.length >= 6) {
                    String key = parts[0].trim();
                    String displayName = localizedTitles.getOrDefault(key, parts[1].trim());
                    result.add(new POIDto(
                            key,
                            displayName,
                            parts[2].trim(),
                            "",
                            "/images/" + key + ".webp",
                            order++,
                            parts[3].trim(),
                            parts[4].trim(),
                            parts[5].trim()
                    ));
                }
            }
        } catch (IOException | NullPointerException e) {
            System.err.println("Error reading pois.txt: " + e.getMessage());
        }

        return result;
    }

    /**
     * Returns a single POI with full localized description.
     * Returns null if the key is not found.
     */
    public POIDto getLocalizedPOIDto(String key, String lang) {
        String languageCode = lang.toUpperCase();
        Map<String, String> localizedTitles = loadLocalizedTitles(languageCode);
        String poisPath = "/META-INF/resources/pointsofinterest/pois.txt";

        try (InputStream is = getClass().getResourceAsStream(poisPath);
             BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8))) {

            String line;
            int order = 0;
            while ((line = reader.readLine()) != null) {
                line = line.trim();
                if (line.isEmpty()) continue;
                String[] parts = line.split(";");
                if (parts.length >= 6 && parts[0].trim().equals(key)) {
                    String displayName = localizedTitles.getOrDefault(key, parts[1].trim());
                    String description = loadDescription(key, languageCode);
                    return new POIDto(
                            key,
                            displayName,
                            parts[2].trim(),
                            description,
                            "/images/" + key + ".webp",
                            order,
                            parts[3].trim(),
                            parts[4].trim(),
                            parts[5].trim()
                    );
                }
                order++;
            }
        } catch (IOException | NullPointerException e) {
            System.err.println("Error reading pois.txt for key " + key + ": " + e.getMessage());
        }

        return null;
    }

    /**
     * Returns available image URLs for a POI by probing the classpath.
     * Checks main image and gallery images 1-3.
     */
    public List<String> getPOIImageUrls(String key) {
        List<String> urls = new ArrayList<>();
        String[] candidates = {
                "/images/" + key + ".webp",
                "/images/" + key + "1.webp",
                "/images/" + key + "2.webp",
                "/images/" + key + "3.webp"
        };
        for (String imagePath : candidates) {
            InputStream probe = getClass().getResourceAsStream("/META-INF/resources" + imagePath);
            if (probe != null) {
                urls.add(imagePath);
                try { probe.close(); } catch (IOException ignored) {}
            }
        }
        return urls;
    }

    /**
     * Returns localized UI text strings (e.g. "welcome", "takeme") for the given language.
     * If keys list is empty, returns all known UI texts.
     */
    public Map<String, String> getLocalizedTexts(String lang, List<String> keys) {
        String languageCode = lang.toUpperCase();
        Map<String, String> allTitles = loadLocalizedTitles(languageCode);
        Map<String, String> result = new HashMap<>();

        if (keys == null || keys.isEmpty()) {
            return new HashMap<>(allTitles);
        }
        for (String k : keys) {
            if (allTitles.containsKey(k)) {
                result.put(k, allTitles.get(k));
            }
        }
        return result;
    }

    private String loadDescription(String key, String languageCode) {
        String descPath = "/META-INF/resources/poi-descriptions/" + key + ".txt";
        String langPrefix = languageCode + ":";
        String enFallback = null;

        try (InputStream is = getClass().getResourceAsStream(descPath);
             BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8))) {

            String line;
            while ((line = reader.readLine()) != null) {
                if (line.startsWith(langPrefix)) {
                    return line.substring(langPrefix.length()).trim();
                }
                if (enFallback == null && line.startsWith("EN:")) {
                    enFallback = line.substring(3).trim();
                }
            }
        } catch (IOException | NullPointerException e) {
            // Description file not found — return empty
        }

        return enFallback != null ? enFallback : "";
    }

    private Map<String, String> loadLocalizedTitles(String languageCode) {
        if (titlesCache.containsKey(languageCode)) {
            return titlesCache.get(languageCode);
        }

        Map<String, String> titles = new HashMap<>();
        String resourcePath = "/META-INF/resources/pointsofinterest/poititles.txt";

        try (InputStream is = getClass().getResourceAsStream(resourcePath);
             BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8))) {

            String line;
            while ((line = reader.readLine()) != null) {
                line = line.trim();
                if (line.isEmpty()) continue;
                String[] parts = line.split(";");
                if (parts.length >= 2) {
                    String name = parts[0].trim();
                    for (int i = 1; i < parts.length; i++) {
                        String part = parts[i].trim();
                        if (part.startsWith(languageCode + ":")) {
                            titles.put(name, part.substring(languageCode.length() + 1));
                            break;
                        }
                    }
                }
            }
        } catch (IOException | NullPointerException e) {
            System.err.println("Error reading poititles.txt: " + e.getMessage());
        }

        titlesCache.put(languageCode, titles);
        return titles;
    }
}
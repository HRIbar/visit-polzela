package com.example.starter.base.services;

import com.example.starter.base.dto.POIDto;
import com.example.starter.base.entity.POITranslationEntity;
import com.example.starter.base.entity.PointOfInterestEntity;
import com.example.starter.base.entity.UITextEntity;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@ApplicationScoped
public class POIService {

    @Inject
    EntityManager em;

    /**
     * Returns all POIs with localized displayName and shortDescription.
     * The full long description is NOT included (use getLocalizedPOIDto for that).
     */
    public List<POIDto> getLocalizedPOIsDto(String lang) {
        String languageCode = lang.toUpperCase();

        @SuppressWarnings("unchecked")
        List<Object[]> rows = em.createQuery(
                "SELECT p, t FROM PointOfInterestEntity p " +
                        "LEFT JOIN POITranslationEntity t ON t.id.poiKey = p.key AND t.id.lang = :lang " +
                        "ORDER BY p.displayOrder")
                .setParameter("lang", languageCode)
                .getResultList();

        List<POIDto> result = new ArrayList<>();
        for (Object[] row : rows) {
            PointOfInterestEntity p = (PointOfInterestEntity) row[0];
            POITranslationEntity t = (POITranslationEntity) row[1];
            String displayName = (t != null && t.displayName != null) ? t.displayName : p.key;
            result.add(new POIDto(
                    p.key,
                    displayName,
                    p.shortDescription,
                    "",
                    "/images/" + p.key + ".webp",
                    p.displayOrder,
                    p.osmUrl,
                    p.googleMapsUrl,
                    p.appleMapsUrl
            ));
        }
        return result;
    }

    /**
     * Returns a single POI with full localized description.
     * Returns null if the key is not found.
     */
    public POIDto getLocalizedPOIDto(String key, String lang) {
        String languageCode = lang.toUpperCase();

        PointOfInterestEntity poi = em.find(PointOfInterestEntity.class, key);
        if (poi == null) {
            return null;
        }

        @SuppressWarnings("unchecked")
        List<POITranslationEntity> translations = em.createQuery(
                "SELECT t FROM POITranslationEntity t WHERE t.id.poiKey = :key AND t.id.lang = :lang")
                .setParameter("key", key)
                .setParameter("lang", languageCode)
                .getResultList();

        POITranslationEntity t = translations.isEmpty() ? null : translations.get(0);

        // Fallback to EN if requested language not found
        if (t == null && !"EN".equals(languageCode)) {
            @SuppressWarnings("unchecked")
            List<POITranslationEntity> enFallback = em.createQuery(
                    "SELECT t FROM POITranslationEntity t WHERE t.id.poiKey = :key AND t.id.lang = 'EN'")
                    .setParameter("key", key)
                    .getResultList();
            t = enFallback.isEmpty() ? null : enFallback.get(0);
        }

        String displayName = (t != null && t.displayName != null) ? t.displayName : poi.key;
        String description = (t != null && t.description != null) ? t.description : "";

        return new POIDto(
                poi.key,
                displayName,
                poi.shortDescription,
                description,
                "/images/" + poi.key + ".webp",
                poi.displayOrder,
                poi.osmUrl,
                poi.googleMapsUrl,
                poi.appleMapsUrl
        );
    }

    /**
     * Returns available image URLs for a POI ordered by sortOrder.
     */
    public List<String> getPOIImageUrls(String key) {
        @SuppressWarnings("unchecked")
        List<String> urls = em.createQuery(
                "SELECT i.imagePath FROM POIImageEntity i WHERE i.poi.key = :key ORDER BY i.sortOrder")
                .setParameter("key", key)
                .getResultList();
        return urls;
    }

    /**
     * Returns localized UI text strings (e.g. "welcome", "takeme") for the given language.
     * If keys list is empty, returns all known UI texts.
     */
    public Map<String, String> getLocalizedTexts(String lang, List<String> keys) {
        String languageCode = lang.toUpperCase();
        Map<String, String> result = new HashMap<>();

        List<UITextEntity> texts;
        if (keys == null || keys.isEmpty()) {
            texts = UITextEntity.list("id.lang", languageCode);
        } else {
            texts = UITextEntity.list("id.lang = ?1 AND id.key IN ?2", languageCode, keys);
        }

        for (UITextEntity t : texts) {
            result.put(t.id.key, t.value);
        }

        // Also include POI title translations when no specific keys are requested
        // (matches old behavior where getLocalizedTexts returned all titles + UI texts)
        if (keys == null || keys.isEmpty()) {
            @SuppressWarnings("unchecked")
            List<POITranslationEntity> poiTitles = em.createQuery(
                    "SELECT t FROM POITranslationEntity t WHERE t.id.lang = :lang")
                    .setParameter("lang", languageCode)
                    .getResultList();
            for (POITranslationEntity pt : poiTitles) {
                result.put(pt.id.poiKey, pt.displayName);
            }
        } else {
            // Check if any requested keys are POI keys (not UI text keys)
            for (String k : keys) {
                if (!result.containsKey(k)) {
                    @SuppressWarnings("unchecked")
                    List<POITranslationEntity> pts = em.createQuery(
                            "SELECT t FROM POITranslationEntity t WHERE t.id.poiKey = :key AND t.id.lang = :lang")
                            .setParameter("key", k)
                            .setParameter("lang", languageCode)
                            .getResultList();
                    if (!pts.isEmpty()) {
                        result.put(k, pts.get(0).displayName);
                    }
                }
            }
        }

        return result;
    }
}
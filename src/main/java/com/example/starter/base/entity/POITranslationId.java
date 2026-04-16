package com.example.starter.base.entity;

import java.io.Serializable;
import java.util.Objects;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

@Embeddable
public class POITranslationId implements Serializable {

    @Column(name = "poi_key", length = 64)
    public String poiKey;

    @Column(name = "lang", length = 2)
    public String lang;

    public POITranslationId() {}

    public POITranslationId(String poiKey, String lang) {
        this.poiKey = poiKey;
        this.lang = lang;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof POITranslationId that)) return false;
        return Objects.equals(poiKey, that.poiKey) && Objects.equals(lang, that.lang);
    }

    @Override
    public int hashCode() {
        return Objects.hash(poiKey, lang);
    }
}


package com.example.starter.base.entity;

import java.io.Serializable;
import java.util.Objects;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

@Embeddable
public class UITextId implements Serializable {

    @Column(name = "text_key", length = 64)
    public String key;

    @Column(name = "lang", length = 2)
    public String lang;

    public UITextId() {}

    public UITextId(String key, String lang) {
        this.key = key;
        this.lang = lang;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof UITextId that)) return false;
        return Objects.equals(key, that.key) && Objects.equals(lang, that.lang);
    }

    @Override
    public int hashCode() {
        return Objects.hash(key, lang);
    }
}


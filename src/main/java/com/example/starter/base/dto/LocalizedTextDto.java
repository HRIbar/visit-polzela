package com.example.starter.base.dto;

import java.util.Map;

public class LocalizedTextDto {

    public Map<String, String> texts;

    public LocalizedTextDto() {}

    public LocalizedTextDto(Map<String, String> texts) {
        this.texts = texts;
    }
}


package com.example.starter.base.resource;

import com.example.starter.base.dto.LocalizedTextDto;
import com.example.starter.base.services.POIService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Path("/api/texts")
@Produces(MediaType.APPLICATION_JSON)
@ApplicationScoped
public class TextResource {

    @Inject
    POIService poiService;

    /**
     * GET /api/texts?lang=EN&keys=welcome,takeme
     * Returns localized UI text strings for the given language.
     * If no keys are provided, all known UI texts are returned.
     */
    @GET
    public LocalizedTextDto getLocalizedTexts(
            @QueryParam("lang") @DefaultValue("EN") String lang,
            @QueryParam("keys") String keysParam) {

        List<String> keys = (keysParam != null && !keysParam.isBlank())
                ? Arrays.asList(keysParam.split(","))
                : Collections.emptyList();

        Map<String, String> texts = poiService.getLocalizedTexts(lang, keys);
        return new LocalizedTextDto(texts);
    }
}


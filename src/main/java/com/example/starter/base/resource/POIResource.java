package com.example.starter.base.resource;

import com.example.starter.base.dto.POIDto;
import com.example.starter.base.dto.POIImagesDto;
import com.example.starter.base.services.POIService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;

@Path("/api/pois")
@Produces(MediaType.APPLICATION_JSON)
@ApplicationScoped
public class POIResource {

    @Inject
    POIService poiService;

    /**
     * GET /api/pois?lang=EN
     * Returns all POIs with localized displayName and shortDescription.
     * Long descriptions are NOT included — use the single-POI endpoint for those.
     */
    @GET
    public List<POIDto> getAllPOIs(@QueryParam("lang") @DefaultValue("EN") String lang) {
        return poiService.getLocalizedPOIsDto(lang);
    }

    /**
     * GET /api/pois/{key}?lang=EN
     * Returns a single POI with the full localized description.
     * Returns 404 if the key is not found.
     */
    @GET
    @Path("/{key}")
    public Response getPOI(@PathParam("key") String key,
                           @QueryParam("lang") @DefaultValue("EN") String lang) {
        POIDto poi = poiService.getLocalizedPOIDto(key, lang);
        if (poi == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("{\"error\":\"POI not found: " + key + "\"}")
                    .build();
        }
        return Response.ok(poi).build();
    }

    /**
     * GET /api/pois/{key}/images
     * Returns all available image URLs for a POI (main image + up to 3 gallery images).
     */
    @GET
    @Path("/{key}/images")
    public POIImagesDto getPOIImages(@PathParam("key") String key) {
        List<String> imageUrls = poiService.getPOIImageUrls(key);
        return new POIImagesDto(key, imageUrls);
    }
}


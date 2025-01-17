package com.example.starter.base.views;

import com.example.starter.base.entity.PointOfInterest;
import com.example.starter.base.services.POIService;
import com.vaadin.flow.component.button.Button;
import com.vaadin.flow.component.html.H2;
import com.vaadin.flow.component.html.Paragraph;
import com.vaadin.flow.component.html.Image;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.component.orderedlayout.HorizontalLayout;
import com.vaadin.flow.router.BeforeEvent;
import com.vaadin.flow.router.HasUrlParameter;
import com.vaadin.flow.router.Route;
import com.vaadin.flow.component.map.Map;
import com.vaadin.flow.component.map.configuration.Coordinate;
import com.vaadin.flow.component.map.configuration.feature.MarkerFeature;

import java.util.List;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

@Route("poi")
public class POIDetailView extends VerticalLayout implements HasUrlParameter<String> {

    private List<PointOfInterest> pointsOfInterest;
    private POIService poiService;

    public POIDetailView(POIService poiService) {
        this.poiService = poiService;
        setAlignItems(Alignment.CENTER);
        setSpacing(true);
        setPadding(true);

        pointsOfInterest = poiService.getPointsOfInterest();
    }

    private String loadDescription(PointOfInterest poi) {
        String fileName = poi.getName() + ".txt";
        String resourcePath = "/META-INF/resources/poi-descriptions/" + fileName;

        try (InputStream is = getClass().getResourceAsStream(resourcePath)) {
            if (is == null) {
                return "Description not available.";
            }
            return new String(is.readAllBytes(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            e.printStackTrace();
            return "Error loading description.";
        }
    }

    @Override
    public void setParameter(BeforeEvent event, String parameter) {
        removeAll();

        PointOfInterest poi = pointsOfInterest.stream()
                .filter(p -> p.getName().equals(parameter))
                .findFirst()
                .orElse(null);

        if (poi != null) {
            H2 title = new H2(poi.getDisplayName());
            add(title);

            // Load and display the detailed description
            String detailedDescription = loadDescription(poi);
            VerticalLayout description = displayDescription(detailedDescription);


            // Image Gallery
            HorizontalLayout gallery = createImageGallery(poi);

            // Google Maps
            Map map = createMap(poi);

            // "Take me there!" button
            Button navigateButton = new Button("Take me there!");
            navigateButton.addClickListener(e -> {
                getUI().ifPresent(ui -> ui.getPage().executeJs(
                        "window.open('https://www.google.com/maps/dir/?api=1&destination=" +
                                poi.getDisplayName().replace(" ", "+") + "', '_blank');"
                ));
            });

            add(title, description, gallery, map, navigateButton);
        } else {
            add(new H2("Point of Interest not found"));
        }
    }

    private HorizontalLayout createImageGallery(PointOfInterest poi) {
        HorizontalLayout gallery = new HorizontalLayout();
        gallery.setSpacing(true);
        gallery.setWidth("100%");
        gallery.setJustifyContentMode(JustifyContentMode.CENTER);

        String basePath = poi.getImagePath().replace(".jpg", "");
        for (int i = 1; i <= 3; i++) {
            String imagePath = "/images/" + basePath + i + ".jpg";
            Image image = new Image(imagePath, poi.getDisplayName());

            // Set width to 320px and height to 180px to maintain 16:9 aspect ratio
            image.setWidth("320px");
            image.setHeight("180px");

            // Ensure the image covers the area without stretching
            image.getStyle().set("object-fit", "cover");

            gallery.add(image);
        }

        return gallery;
    }

    private Map createMap(PointOfInterest poi) {
        Map map = new Map();
        map.setHeight("400px");
        map.setWidth("80%");

        // You'll need to add actual coordinates for each POI
        Coordinate poiLocation = parseOsmUrl(poi.getMapUrl()); // Replace with actual coordinates
        map.setCenter(poiLocation);
        map.setZoom(15);

        MarkerFeature marker = new MarkerFeature(poiLocation);
        map.getFeatureLayer().addFeature(marker);

        return map;
    }

    private Coordinate parseOsmUrl(String url) {
        try {
            String[] parts = url.split("/");
            if (parts.length >= 5) {
                double lat = Double.parseDouble(parts[parts.length - 2]);
                double lon = Double.parseDouble(parts[parts.length - 1]);
                return new Coordinate(lon, lat);
            }
        } catch (NumberFormatException | ArrayIndexOutOfBoundsException e) {
            e.printStackTrace();
        }
        return new Coordinate(0, 0); // Default coordinate if parsing fails
    }

    private VerticalLayout displayDescription(String description) {
        VerticalLayout descriptionLayout = new VerticalLayout();
        descriptionLayout.setSpacing(true);
        descriptionLayout.setPadding(false);
        descriptionLayout.setAlignItems(Alignment.CENTER);

        String[] paragraphs = description.split("\n\n");
        int totalParagraphs = paragraphs.length;
        int paragraphsPerSection = (int) Math.ceil((double) totalParagraphs / 3);

        for (int i = 0; i < 3; i++) {
            StringBuilder sectionText = new StringBuilder();
            for (int j = i * paragraphsPerSection; j < Math.min((i + 1) * paragraphsPerSection, totalParagraphs); j++) {
                sectionText.append(paragraphs[j]).append("\n\n");
            }
            if (!sectionText.isEmpty()) {
                Paragraph p = new Paragraph(sectionText.toString().trim());
                p.getStyle().set("max-width", "800px");
                p.getStyle().set("white-space", "pre-wrap");
                descriptionLayout.add(p);
            }
        }

        return descriptionLayout;
    }

    private String loadMapUrlFromFile(String fileName) {
        String resourcePath = "/META-INF/resources/pointsofinterest/" + fileName;
        try (InputStream is = getClass().getResourceAsStream(resourcePath)) {
            if (is == null) {
                return "Map URL not available.";
            }
            return new String(is.readAllBytes(), StandardCharsets.UTF_8).trim();
        } catch (IOException e) {
            e.printStackTrace();
            return "Error loading map URL.";
        }
    }
}
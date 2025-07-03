package com.example.starter.base.views;

import com.example.starter.base.entity.PointOfInterest;
import com.example.starter.base.services.POIService;
import com.vaadin.flow.component.applayout.AppLayout;
import com.vaadin.flow.component.dependency.CssImport;
import com.vaadin.flow.component.html.H2;
import com.vaadin.flow.component.html.Paragraph;
import com.vaadin.flow.component.html.Image;
import com.vaadin.flow.component.orderedlayout.FlexComponent;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.component.orderedlayout.HorizontalLayout;
import com.vaadin.flow.router.BeforeEvent;
import com.vaadin.flow.router.HasUrlParameter;
import com.vaadin.flow.router.PreserveOnRefresh;
import com.vaadin.flow.router.Route;

import com.vaadin.flow.server.VaadinService;
import org.jboss.logging.Logger;
import software.xdev.vaadin.maps.leaflet.registry.LComponentManagementRegistry;
import software.xdev.vaadin.maps.leaflet.MapContainer;

import com.vaadin.flow.component.dialog.Dialog;

import com.vaadin.flow.component.dependency.JavaScript;
import com.vaadin.flow.component.dependency.StyleSheet;

import java.util.List;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Locale;


@JavaScript("https://unpkg.com/leaflet@1.7.1/dist/leaflet.js")
@StyleSheet("https://unpkg.com/leaflet@1.7.1/dist/leaflet.css")
@CssImport("./styles/poi-detail-view-styles.css")
@Route("poi")
@PreserveOnRefresh
public class POIDetailView extends AppLayout implements HasUrlParameter<String> {

    private static final Logger LOG = Logger.getLogger(POIDetailView.class);
    private List<PointOfInterest> pointsOfInterest;
    private POIService poiService;
    private final LComponentManagementRegistry componentRegistry;

    private VerticalLayout content;

    public POIDetailView(POIService poiService, LComponentManagementRegistry componentRegistry) {
        this.poiService = poiService;
        this.componentRegistry = componentRegistry;

        this.content = new VerticalLayout();
        content.addClassName("poi-detail-content");
        content.setAlignItems(FlexComponent.Alignment.CENTER);
        content.setSpacing(true);
        content.setPadding(true);

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
        content.removeAll();

        PointOfInterest poi = pointsOfInterest.stream()
                .filter(p -> p.getName().equals(parameter))
                .findFirst()
                .orElse(null);

        if (poi != null) {
            H2 title = new H2(poi.getDisplayName());
            title.addClassName("poi-title");
            content.add(title);

            Image image = new Image(poi.getImageResource(), poi.getDisplayName());
            image.addClassName("poi-main-image");

            String detailedDescription = loadDescription(poi);
            VerticalLayout description = displayDescription(detailedDescription);

            HorizontalLayout gallery = createImageGallery(poi);

            MapContainer map = createMap(poi);
            map.addClassName("poi-map");

            Image navigateButton = new Image("/images/navigationbutton.webp", "Navigate with Google Maps");
            navigateButton.addClassName("navigate-button");
            navigateButton.getElement().getStyle().set("cursor", "pointer");
            navigateButton.addClickListener(e -> {
                getUI().ifPresent(ui -> ui.getPage().executeJs(
                        "window.open($0, '_blank');", poi.getNavigationUrl()
                ));
            });

            Image appleNavigateButton = new Image("/images/applenavigationbutton.webp", "Navigate with Apple Maps");
            appleNavigateButton.addClassName("navigate-button");
            appleNavigateButton.getElement().getStyle().set("cursor", "pointer");
            appleNavigateButton.addClickListener(e -> {
                getUI().ifPresent(ui -> ui.getPage().executeJs(
                        "window.open($0, '_blank');", poi.getAppleNavigationUrl()
                ));
            });

            content.add(title, image, description, gallery, navigateButton,appleNavigateButton, map);
        } else {
            content.add(new H2("Point of Interest not found"));
        }

        setContent(content);
    }

    private HorizontalLayout createImageGallery(PointOfInterest poi) {
        HorizontalLayout gallery = new HorizontalLayout();
        gallery.addClassName("image-gallery");

        String basePath = poi.getImagePath().replace(".webp", "");
        for (int i = 1; i <= 3; i++) {
            String imagePath = "/images/" + basePath + i + ".webp";
            if (VaadinService.getCurrent().getResourceAsStream(imagePath) != null) {
                Image image = new Image(imagePath, poi.getDisplayName());
                image.addClassName("gallery-image");

                image.getElement().addEventListener("click", e -> showEnlargedImage(imagePath, poi.getDisplayName()));

                gallery.add(image);
            }
        }

        return gallery;
    }



    private MapContainer createMap(PointOfInterest poi) {
        // Create the MapContainer
        MapContainer mapContainer = new MapContainer(componentRegistry);
        mapContainer.setHeight("400px");
        mapContainer.setWidth("80%");

        // Parse the OSM URL to get coordinates
        double[] coordinates = parseOsmUrl(poi.getMapUrl());
        double lat = coordinates[0];
        double lng = coordinates[1];

        // Use JavaScript to initialize the map after the component is attached
        mapContainer.addAttachListener(event -> getUI().ifPresent(ui -> ui.access(() -> {
            String js = String.format(Locale.US,
                    "var map = L.map(arguments[0]).setView([%f, %f], 15);" +
                            "L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {" +
                            "    attribution: '&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors'" +
                            "}).addTo(map);" +
                            "L.marker([%f, %f]).addTo(map).bindPopup('%s').openPopup();",
                    lat, lng,
                    lat, lng,
                    poi.getDisplayName().replace("'", "\\'")
            );
            ui.getPage().executeJs(js, mapContainer.getElement());
        })));

        return mapContainer;
    }

    private double[] parseOsmUrl(String url) {
        try {
            String[] parts = url.split("/");
            if (parts.length >= 5) {
                double lat = Double.parseDouble(parts[parts.length - 2]);
                double lng = Double.parseDouble(parts[parts.length - 1]);
                return new double[]{lat, lng};
            }
        } catch (NumberFormatException | ArrayIndexOutOfBoundsException e) {
            LOG.error("Error parsing OSM URL: " + url, e);
        }
        return new double[]{0, 0}; // Default coordinate if parsing fails
    }


    private VerticalLayout displayDescription(String description) {
        VerticalLayout descriptionLayout = new VerticalLayout();
        descriptionLayout.setSpacing(true);
        descriptionLayout.setPadding(false);
        descriptionLayout.setAlignItems(FlexComponent.Alignment.CENTER);

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

    private void showEnlargedImage(String imagePath, String altText) {
        Dialog dialog = new Dialog();
        dialog.addClassName("image-dialog");
        dialog.setCloseOnEsc(true);
        dialog.setCloseOnOutsideClick(true);

        Image enlargedImage = new Image(imagePath, altText);
        enlargedImage.addClassName("enlarged-image");

        dialog.add(enlargedImage);

        enlargedImage.addClickListener(e -> dialog.close());

        dialog.open();
    }
}
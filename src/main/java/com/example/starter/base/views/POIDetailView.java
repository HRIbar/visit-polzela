package com.example.starter.base.views;

import com.example.starter.base.entity.PointOfInterest;
import com.example.starter.base.services.POIService;
import com.vaadin.flow.component.applayout.AppLayout;
import com.vaadin.flow.component.dependency.CssImport;
import com.vaadin.flow.component.html.Div;
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
import com.vaadin.flow.server.VaadinSession;
import org.jboss.logging.Logger;
import software.xdev.vaadin.maps.leaflet.registry.LComponentManagementRegistry;
import software.xdev.vaadin.maps.leaflet.MapContainer;

import com.vaadin.flow.component.dialog.Dialog;

import com.vaadin.flow.component.dependency.JavaScript;
import com.vaadin.flow.component.dependency.StyleSheet;

import java.util.List;
import java.io.IOException;
import java.io.InputStream;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.stream.Stream;


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

        // Get POIs with current locale instead of default
        Locale currentLocale = VaadinSession.getCurrent().getLocale();
        pointsOfInterest = poiService.getPointsOfInterest(currentLocale);
    }

    private String loadDescription(PointOfInterest poi) {
        String fileName = poi.getName() + ".txt";
        String resourcePath = "/META-INF/resources/poi-descriptions/" + fileName;

        try (InputStream is = getClass().getResourceAsStream(resourcePath)) {
            if (is == null) {
                return "Description not available.";
            }
            String fullDescription = new String(is.readAllBytes(), StandardCharsets.UTF_8);
            Locale locale = VaadinSession.getCurrent().getLocale();
            String lang = locale != null ? locale.getLanguage().toUpperCase() : "EN";

            return Stream.of(fullDescription.split("\n"))
                    .filter(line -> line.startsWith(lang + ":"))
                    .map(line -> line.substring(lang.length() + 1).trim())
                    .findFirst()
                    .orElseGet(() -> Stream.of(fullDescription.split("\n")) // Fallback to EN
                            .filter(line -> line.startsWith("EN:"))
                            .map(line -> line.substring(3).trim())
                            .findFirst()
                            .orElse("Description not available in the selected language."));
        } catch (IOException e) {
            e.printStackTrace();
            return "Error loading description.";
        }
    }

    @Override
    public void setParameter(BeforeEvent event, String parameter) {
        content.removeAll();

        // Refresh POI data with current locale to ensure we have the latest translations
        Locale currentLocale = VaadinSession.getCurrent().getLocale();
        pointsOfInterest = poiService.getPointsOfInterest(currentLocale);

        PointOfInterest poi = pointsOfInterest.stream()
                .filter(p -> p.getName().equals(parameter))
                .findFirst()
                .orElse(null);

        if (poi != null) {
            // The poi.getDisplayName() now contains the localized title from poititles.txt
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

            // Get localized "Take me there!" text
            String takeMeText = getLocalizedTakeMeText(currentLocale);

            Div navigateButtonContainer = createNavigationButton(
                "/images/navigationbutton.webp",
                "Navigate with Google Maps",
                takeMeText,
                poi.getNavigationUrl()
            );

            Div appleNavigateButtonContainer = createNavigationButton(
                "/images/applenavigationbutton.webp",
                "Navigate with Apple Maps",
                takeMeText,
                poi.getAppleNavigationUrl()
            );

            content.add(title, image, description, gallery, navigateButtonContainer, appleNavigateButtonContainer, map);
        } else {
            content.add(new H2("Point of Interest not found"));
        }

        setContent(content);
    }

    private String getLocalizedTakeMeText(Locale locale) {
        String languageCode = locale.getLanguage().toUpperCase();
        String resourcePath = "/META-INF/resources/pointsofinterest/poititles.txt";

        try (InputStream is = getClass().getResourceAsStream(resourcePath);
             BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8))) {

            String line;
            while ((line = reader.readLine()) != null) {
                if (line.startsWith("takeme;")) {
                    String[] parts = line.split(";");
                    for (int i = 1; i < parts.length; i++) {
                        String part = parts[i].trim();
                        if (part.startsWith(languageCode + ":")) {
                            return part.substring(languageCode.length() + 1);
                        }
                    }
                    // Fallback to English if language not found
                    for (int i = 1; i < parts.length; i++) {
                        String part = parts[i].trim();
                        if (part.startsWith("EN:")) {
                            return part.substring(3);
                        }
                    }
                }
            }
        } catch (IOException | NullPointerException e) {
            e.printStackTrace();
        }

        return "Take me there!"; // Default fallback
    }

    private Div createNavigationButton(String imagePath, String altText, String overlayText, String url) {
        Div buttonContainer = new Div();
        buttonContainer.addClassName("navigation-button-container");
        buttonContainer.getStyle().set("position", "relative");
        buttonContainer.getStyle().set("display", "inline-block");
        buttonContainer.getStyle().set("cursor", "pointer");

        Image buttonImage = new Image(imagePath, altText);
        buttonImage.addClassName("navigate-button");

        H2 overlayTextElement = new H2(overlayText);
        overlayTextElement.addClassName("navigation-overlay-text");
        overlayTextElement.getStyle().set("position", "absolute");
        overlayTextElement.getStyle().set("top", "50%");
        overlayTextElement.getStyle().set("left", "50%");
        overlayTextElement.getStyle().set("transform", "translate(-50%, -50%)");
        overlayTextElement.getStyle().set("margin", "0");
        overlayTextElement.getStyle().set("color", "black");
        overlayTextElement.getStyle().set("font-weight", "bold");
        //overlayTextElement.getStyle().set("text-shadow", "2px 2px 4px rgba(0,0,0,0.8)");
        overlayTextElement.getStyle().set("pointer-events", "none");
        overlayTextElement.getStyle().set("font-size", "2.5em");
        overlayTextElement.getStyle().set("text-align", "center");

        buttonContainer.add(buttonImage, overlayTextElement);

        buttonContainer.addClickListener(e -> {
            getUI().ifPresent(ui -> ui.getPage().executeJs(
                    "window.open($0, '_blank');", url
            ));
        });

        return buttonContainer;
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


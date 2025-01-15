package com.example.starter.base.views;

import com.example.starter.base.entity.PointOfInterest;
import com.vaadin.flow.component.html.Div;
import com.vaadin.flow.component.html.H1;
import com.vaadin.flow.component.html.H2;
import com.vaadin.flow.component.html.Image;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.router.Route;
import com.vaadin.flow.router.RouterLink;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Route("")
public class MainView extends VerticalLayout {

    public MainView() {
        setAlignItems(Alignment.CENTER);
        setSpacing(true);
        setPadding(true);

        H1 title = new H1("Welcome to Polzela");
        add(title);

        List<PointOfInterest> pointsOfInterest = getPointsOfInterest();

        for (PointOfInterest poi : pointsOfInterest) {
            RouterLink poiLink = createPoiLink(poi);
            add(poiLink);
        }
    }

    private RouterLink createPoiLink(PointOfInterest poi) {
        String poiUrl = poi.getName().toLowerCase().replace(" ", "-");
        RouterLink link = new RouterLink("", POIDetailView.class, poiUrl);

        Div container = new Div();
        container.getStyle()
                .set("cursor", "pointer")
                .set("text-align", "center")
                .set("margin-bottom", "30px")
                .set("padding", "10px")
                .set("border", "1px solid #ddd")
                .set("border-radius", "8px")
                .set("transition", "box-shadow 0.3s");

        H2 poiTitle = new H2(poi.getName());
        poiTitle.getStyle().set("margin", "0 0 10px 0");

        Image image = new Image(poi.getImageResource(), poi.getName());
        image.setWidth("300px");

        container.add(poiTitle, image);
        link.add(container);

        // Add hover effect
        link.getElement().addEventListener("mouseover", e ->
                container.getStyle().set("box-shadow", "0 4px 8px rgba(0,0,0,0.1)")
        );
        link.getElement().addEventListener("mouseout", e ->
                container.getStyle().set("box-shadow", "none")
        );

        return link;
    }

    private List<PointOfInterest> getPointsOfInterest() {
        return List.of(
                new PointOfInterest("Polzela Castle", "Historic castle in Polzela.", "castle.jpg", loadMapUrlFromFile("castle.txt"), loadMapUrlFromFile("go-castle.txt")),
                new PointOfInterest("Local Park", "A serene park perfect for relaxation.", "park.jpg", loadMapUrlFromFile("park.txt"), loadMapUrlFromFile("go-park.txt")),
                new PointOfInterest("Ice Cream Seller", "Delicious local ice cream.", "icecream.jpg", loadMapUrlFromFile("icecream.txt"), loadMapUrlFromFile("go-icecream.txt"))
        );
    }

    private String loadMapUrlFromFile(String fileName) {
        String resourcePath = "/META-INF/resources/" + fileName;
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
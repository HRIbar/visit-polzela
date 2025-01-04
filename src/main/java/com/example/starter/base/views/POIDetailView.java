package com.example.starter.base.views;

import com.example.starter.base.entity.PointOfInterest;
import com.vaadin.flow.component.html.Anchor;
import com.vaadin.flow.component.html.H2;
import com.vaadin.flow.component.html.Image;
import com.vaadin.flow.component.html.Paragraph;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.router.BeforeEvent;
import com.vaadin.flow.router.HasUrlParameter;
import com.vaadin.flow.router.Route;

import java.util.List;

@Route("poi")
public class POIDetailView extends VerticalLayout implements HasUrlParameter<String> {

    private List<PointOfInterest> pointsOfInterest;

    public POIDetailView() {
        // Initialize your points of interest list here
        pointsOfInterest = List.of(
            new PointOfInterest("Polzela Castle", "Historic castle in Polzela.", "castle.jpg", "https://maps.app.goo.gl/zAGbpjfUBCKdj5Ue6"),
            new PointOfInterest("Šenek Manor", "Renaissance manor house.", "senek.jpg", "https://maps.app.goo.gl/zAGbpjfUBCKdj5Ue6")
            // Add more points of interest as needed
        );
    }

    @Override
    public void setParameter(BeforeEvent event, String parameter) {
        removeAll();

        PointOfInterest poi = pointsOfInterest.stream()
                .filter(p -> p.getName().toLowerCase().replace(" ", "-").equals(parameter))
                .findFirst()
                .orElse(null);

        if (poi != null) {
            H2 title = new H2(poi.getName());
            Paragraph description = new Paragraph(poi.getDescription());
            Image image = new Image(poi.getImageResource(), poi.getName());
            image.setWidth("300px");  // Set a fixed width for the image
            Anchor mapLink = new Anchor(poi.getMapUrl(), "View on Google Maps");
            mapLink.setTarget("_blank");

            add(title, description, image, mapLink);
        } else {
            add(new H2("Point of Interest not found"));
        }
    }
}
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
        setAlignItems(Alignment.CENTER);
        pointsOfInterest = getPointsOfInterest();
    }

    @Override
    public void setParameter(BeforeEvent event, String parameter) {
        removeAll();

        PointOfInterest poi = pointsOfInterest.stream()
                .filter(p -> p.getName().equals(parameter))
                .findFirst()
                .orElse(null);

        if (poi != null) {
            H2 title = new H2(poi.getName());
            Image image = new Image(poi.getImageUrl(), poi.getName());
            image.setWidth("300px");

            Paragraph description = new Paragraph(poi.getDescription());
            Anchor mapLink = new Anchor(poi.getMapUrl(), "View on Google Maps");
            mapLink.setTarget("_blank");

            add(title, image, description, mapLink);
        } else {
            add(new H2("Point of Interest not found"));
        }
    }

    private List<PointOfInterest> getPointsOfInterest() {
        return List.of(
                new PointOfInterest("Polzela Castle", "Historic castle in Polzela.", "images/castle.jpg", "https://maps.app.goo.gl/zAGbpjfUBCKdj5Ue6"),
                new PointOfInterest("Local Park", "A serene park perfect for relaxation.", "images/park.jpg", "https://maps.app.goo.gl/zAGbpjfUBCKdj5Ue6"),
                new PointOfInterest("Ice Cream Seller", "Delicious local ice cream.", "images/icecream.jpg", "https://maps.app.goo.gl/zAGbpjfUBCKdj5Ue6")
        );
    }
}
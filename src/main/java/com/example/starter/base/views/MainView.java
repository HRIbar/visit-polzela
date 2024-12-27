package com.example.starter.base.views;

import com.example.starter.base.entity.PointOfInterest;
import com.vaadin.flow.component.html.H1;
import com.vaadin.flow.component.html.Image;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.component.button.Button;
import com.vaadin.flow.router.Route;
import com.vaadin.flow.router.RouteParameters;
import com.vaadin.flow.router.RouterLink;

import java.util.List;

@Route("")
public class MainView extends VerticalLayout {

    public MainView() {
        setAlignItems(Alignment.CENTER);

        H1 title = new H1("Welcome to Polzela");
        add(title);

        List<PointOfInterest> pointsOfInterest = getPointsOfInterest();

        for (PointOfInterest poi : pointsOfInterest) {
            Image image = new Image(poi.getImageUrl(), poi.getName());
            image.setWidth("200px");
            image.setHeight("200px");

            Button poiButton = new Button(poi.getName(), image);
            poiButton.setWidth("220px");
            poiButton.addClickListener(e -> {
                getUI().ifPresent(ui -> ui.navigate(
                        POIDetailView.class,
                        new RouteParameters("name", poi.getName())
                ));
            });

            add(poiButton);
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
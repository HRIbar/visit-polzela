package com.example.starter.base.views;

import com.example.starter.base.entity.PointOfInterest;
import com.example.starter.base.services.POIService;
import com.vaadin.flow.component.html.Div;
import com.vaadin.flow.component.html.H1;
import com.vaadin.flow.component.html.H2;
import com.vaadin.flow.component.html.Image;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.router.Route;
import com.vaadin.flow.router.RouterLink;

import java.util.List;

@Route("")
public class MainView extends VerticalLayout {

    private POIService poiService;

    public MainView(POIService poiService) {
        this.poiService = poiService;
        setAlignItems(Alignment.CENTER);
        setSpacing(true);
        setPadding(true);

        Div titleContainer = new Div();
        titleContainer.getStyle()
                .set("background-image", "url('images/polzela.jpg')")
                .set("background-size", "cover")
                .set("background-position", "center")
                .set("width", "100%")
                .set("height", "200px")
                .set("position", "relative")
                .set("margin-bottom", "30px")
                .set("display", "flex")
                .set("flex-direction", "column")
                .set("justify-content", "flex-start")  // Align to the top
                .set("align-items", "flex-start");  // Align to the left

        Div titleDiv = new Div();
        titleDiv.getStyle()
                .set("color", "black")
                .set("margin-left", "20px")  // Add left margin
                .set("padding", "10px")
                .set("border-radius", "5px")
                .set("text-align", "left")
                .set("background-color", "transparent")  // Semi-transparent white background
                .set("max-width", "50%")  // Limit width to avoid overlapping with image
                .set("position", "absolute")  // Position absolutely within the container
                .set("top", "0")  // Align to the top
                .set("left", "0");  // Align to the left


        H2 welcomeText = new H2("Welcome to");
        welcomeText.getStyle()
                .set("margin", "0")
                .set("font-size", "24px");

        H1 polzelaText = new H1("Polzela");
        polzelaText.getStyle()
                .set("margin", "0")
                .set("font-weight", "bold")
                .set("font-size", "36px");

        titleDiv.add(welcomeText, polzelaText);
        titleContainer.add(titleDiv);
        add(titleContainer);

        List<PointOfInterest> pointsOfInterest =  poiService.getPointsOfInterest();

        for (PointOfInterest poi : pointsOfInterest) {
            RouterLink poiLink = createPoiLink(poi);
            add(poiLink);
        }
    }

    private RouterLink createPoiLink(PointOfInterest poi) {
        String poiUrl = poi.getName();
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

        H2 poiTitle = new H2(poi.getDisplayName());
        poiTitle.getStyle().set("margin", "0 0 10px 0");

        Image image = new Image(poi.getImageResource(), poi.getDisplayName());
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
}
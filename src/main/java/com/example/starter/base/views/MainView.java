package com.example.starter.base.views;

import com.example.starter.base.entity.PointOfInterest;
import com.example.starter.base.services.POIService;
import com.vaadin.flow.component.applayout.AppLayout;
import com.vaadin.flow.component.html.Div;
import com.vaadin.flow.component.html.H1;
import com.vaadin.flow.component.html.H2;
import com.vaadin.flow.component.html.Image;
import com.vaadin.flow.component.orderedlayout.FlexComponent;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.router.Route;
import com.vaadin.flow.router.RouterLink;
import com.vaadin.flow.component.orderedlayout.FlexLayout;
import com.vaadin.flow.component.dependency.CssImport;

import java.util.List;

@Route("")
@CssImport("./styles/main-view-styles.css")
public class MainView extends AppLayout {

    private POIService poiService;

    public MainView(POIService poiService) {
        this.poiService = poiService;

        VerticalLayout content = new VerticalLayout();
        content.addClassName("main-content");
        content.setAlignItems(FlexComponent.Alignment.CENTER);
        content.setSpacing(false);
        content.setPadding(false);

        Div titleContainer = new Div();
        titleContainer.addClassName("title-container");

        Div titleDiv = new Div();
        titleDiv.addClassName("title-div");

        H2 welcomeText = new H2("Welcome to");
        welcomeText.addClassName("welcome-text");

        H1 polzelaText = new H1("Polzela");
        polzelaText.addClassName("polzela-text");

        titleDiv.add(welcomeText, polzelaText);
        titleContainer.add(titleDiv);
        content.add(titleContainer);

        FlexLayout poiContainer = new FlexLayout();
        poiContainer.addClassName("poi-container");

        List<PointOfInterest> pointsOfInterest = poiService.getPointsOfInterest();

        for (PointOfInterest poi : pointsOfInterest) {
            RouterLink poiLink = createPoiLink(poi);
            poiContainer.add(poiLink);
        }

        content.add(poiContainer);
        setContent(content);
    }

    private RouterLink createPoiLink(PointOfInterest poi) {
        String poiUrl = poi.getName();
        RouterLink link = new RouterLink("", POIDetailView.class, poiUrl);
        link.addClassName("poi-link");

        Div container = new Div();
        container.addClassName("poi-item");

        H2 poiTitle = new H2(poi.getDisplayName());
        poiTitle.addClassName("poi-title");

        Image image = new Image(poi.getImageResource(), poi.getDisplayName());
        image.addClassName("poi-image");

        container.add(poiTitle, image);
        link.add(container);

        return link;
    }
}
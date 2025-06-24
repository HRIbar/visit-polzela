package com.example.starter.base.views;

import com.example.starter.base.entity.PointOfInterest;
import com.example.starter.base.services.POIService;
import com.vaadin.flow.component.UI;
import com.vaadin.flow.component.applayout.AppLayout;
import com.vaadin.flow.component.dependency.JavaScript;
import com.vaadin.flow.component.html.Div;
import com.vaadin.flow.component.html.H2;
import com.vaadin.flow.component.html.Image;
import com.vaadin.flow.component.orderedlayout.FlexComponent;
import com.vaadin.flow.component.orderedlayout.HorizontalLayout;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.router.Route;
import com.vaadin.flow.router.RouterLink;
import com.vaadin.flow.component.orderedlayout.FlexLayout;
import com.vaadin.flow.component.dependency.CssImport;
import elemental.json.Json;
import elemental.json.JsonArray;
import elemental.json.JsonObject;

import java.util.List;

@Route("")
@CssImport("./styles/main-view-styles.css")
@JavaScript("./offline-store.js")
public class MainView extends AppLayout {
    
    private final POIService poiService;
    
    public MainView(POIService poiService) {
        this.poiService = poiService;
        

        storePointsOfInterestForOffline();
        
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

        Image grbImage = new Image("/images/grbpolzela.webp", "Polzela Coat of Arms");
        grbImage.addClassName("grb-image");


        HorizontalLayout headerLayout = new HorizontalLayout(welcomeText, grbImage);
        headerLayout.setAlignItems(FlexComponent.Alignment.CENTER);
        headerLayout.addClassName("header-layout");

        titleDiv.add(headerLayout);


        Div welcomeContainer = new Div();
        welcomeContainer.addClassName("welcome-container");
        welcomeContainer.add(titleDiv);
        content.add(welcomeContainer);


        titleContainer = new Div();
        titleContainer.addClassName("title-container");


        Image titleImage = new Image("/images/polzela.webp", "Polzela panorama");
        titleImage.addClassName("title-image");


        Div titleImageContainer = new Div(titleImage);
        titleImageContainer.addClassName("title-image-container");

        titleContainer.add(titleImageContainer);
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
    
    private void storePointsOfInterestForOffline() {
        List<PointOfInterest> pois = poiService.getPointsOfInterest();
        JsonArray poisArray = Json.createArray();
        
        for (int i = 0; i < pois.size(); i++) {
            PointOfInterest poi = pois.get(i);
            JsonObject poiJson = Json.createObject();
            
            poiJson.put("name", poi.getName());
            poiJson.put("displayName", poi.getDisplayName());
            poiJson.put("description", poi.getDescription());
            poiJson.put("imagePath", poi.getImagePath());
            poiJson.put("mapUrl", poi.getMapUrl());
            poiJson.put("navigationUrl", poi.getNavigationUrl());
            
            poisArray.set(i, poiJson);
        }
        
        // Execute JavaScript to store POIs in IndexedDB
        UI.getCurrent().getPage().executeJs(
            "if (window.offlineStore) { window.offlineStore.storePOIs($0); }",
            poisArray
        );
    }

    private RouterLink createPoiLink(PointOfInterest poi) {
        String poiUrl = poi.getName();
        RouterLink link = new RouterLink("", POIDetailView.class, poiUrl);
        link.addClassName("poi-link");

        Div container = new Div();
        container.addClassName("poi-item");

        H2 poiTitle = new H2(poi.getDisplayName());
        poiTitle.addClassName("poi-title");

        // Create a placeholder image
        Image placeholderImage = new Image("/META-INF/resources/images/placeholder.png", "Loading...");
        placeholderImage.addClassName("poi-image");

        // Create the actual image with lazy loading
        Image lazyImage = new Image(poi.getImageResource(), poi.getDisplayName());
        lazyImage.addClassName("poi-image");
        lazyImage.setVisible(false);

        // Set up lazy loading
        lazyImage.addAttachListener(event -> {
            lazyImage.setVisible(true);
            placeholderImage.setVisible(false);
        });

        container.add(poiTitle, placeholderImage, lazyImage);
        link.add(container);

        return link;
    }
}
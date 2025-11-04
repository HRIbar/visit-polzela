package com.example.starter.base.views;

import com.example.starter.base.entity.PointOfInterest;
import com.example.starter.base.services.POIService;
import com.vaadin.flow.component.UI;
import com.vaadin.flow.component.applayout.AppLayout;
import com.vaadin.flow.component.button.Button;
import com.vaadin.flow.component.dependency.CssImport;
import com.vaadin.flow.component.dependency.JavaScript;
import com.vaadin.flow.component.html.Div;
import com.vaadin.flow.component.html.H2;
import com.vaadin.flow.component.html.Image;
import com.vaadin.flow.component.orderedlayout.FlexComponent;
import com.vaadin.flow.component.orderedlayout.FlexLayout;
import com.vaadin.flow.component.orderedlayout.HorizontalLayout;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.router.Route;
import com.vaadin.flow.router.RouterLink;
import elemental.json.Json;
import elemental.json.JsonArray;
import elemental.json.JsonObject;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;


// Disabled - Using React/Hilla MainView.tsx instead (kept for history)
// @Route("")
@CssImport("./styles/main-view-styles.css")
@JavaScript("./offline-store.js")
public class MainView extends AppLayout {

    private final POIService poiService;
    private Image activeFlag;

    public MainView(POIService poiService) {
        this.poiService = poiService;

        storePointsOfInterestForOffline();

        HorizontalLayout flagLayout = new HorizontalLayout();
        flagLayout.addClassName("flag-layout");
        flagLayout.setAlignItems(FlexComponent.Alignment.CENTER);
        flagLayout.setSpacing(true);
        flagLayout.setPadding(true);

        // Add flags to the flagLayout
        Image siFlag = createFlagButton("/images/siflag.webp", "SI Flag", "SL");
        flagLayout.add(siFlag);

        Image ukFlag = createFlagButton("/images/ukflag.webp", "UK Flag", "EN");
        flagLayout.add(ukFlag);
        // Set English flag as default active
        setActiveFlag(ukFlag);

        Image deFlag = createFlagButton("/images/deflag.webp", "DE Flag", "DE");
        flagLayout.add(deFlag);

        Image nlFlag = createFlagButton("/images/nlflag.webp", "NL Flag", "NL");
        flagLayout.add(nlFlag);

        Button installButton = new Button("Install App");
        installButton.setVisible(true);
        installButton.addClickListener(e -> {
            UI.getCurrent().getPage().executeJs("window.pwaInstall();");
        });

        // Listen for the custom event from sw-register.js to show the button
        UI.getCurrent().getElement().executeJs(
                "document.body.addEventListener('vaadin-pwa-installable', () => $0.$server.showInstallButton());",
                getElement()
        );

        // Listen for the custom event to hide the button after installation
        UI.getCurrent().getElement().executeJs(
                "document.body.addEventListener('vaadin-pwa-installed', () => $0.$server.hideInstallButton());",
                getElement()
        );

        flagLayout.add(installButton);

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
        content.add(flagLayout, welcomeContainer);


        titleContainer = new Div();
        titleContainer.addClassName("title-container");


        Image titleImage = new Image("/images/polzela.webp", "Polzela panorama");
        titleImage.addClassName("title-image");


        Div titleImageContainer = new Div(titleImage);
        titleImageContainer.addClassName("title-image-container");

        titleContainer.add(titleImageContainer);
        content.add(titleContainer);

        // Create POI container and populate it
        refreshPOIContainer(content);

        setContent(content);
    }

    private void refreshPOIContainer(VerticalLayout content) {
        // Remove existing POI container if it exists
        content.getChildren()
                .filter(component -> component.getClass().equals(FlexLayout.class))
                .findFirst()
                .ifPresent(content::remove);

        FlexLayout poiContainer = new FlexLayout();
        poiContainer.addClassName("poi-container");

        // Get current locale from session
        Locale currentLocale = UI.getCurrent().getSession().getLocale();
        List<PointOfInterest> pointsOfInterest = poiService.getPointsOfInterest(currentLocale);

        for (PointOfInterest poi : pointsOfInterest) {
            RouterLink poiLink = createPoiLink(poi);
            poiContainer.add(poiLink);
        }

        content.add(poiContainer);
    }

    private void setActiveFlag(Image flag) {
        // Remove active class from current active flag
        if (activeFlag != null) {
            activeFlag.removeClassName("active-flag");
        }

        // Set new active flag
        activeFlag = flag;
        activeFlag.addClassName("active-flag");
    }

    private Image createFlagButton(String imagePath, String altText, String languageCode) {
        Image flag = new Image(imagePath, altText);
        flag.addClassName("small-flag");
        flag.getStyle().set("cursor", "pointer");
        flag.addClickListener(event -> {
            UI.getCurrent().getSession().setLocale(new Locale(languageCode));

            // Set this flag as active
            setActiveFlag(flag);

            // Refresh the POI container to show localized titles
            VerticalLayout content = (VerticalLayout) getContent();
            refreshPOIContainer(content);
        });
        return flag;
    }


    private void storePointsOfInterestForOffline() {
        // Get current locale from session
        Locale currentLocale = UI.getCurrent().getSession().getLocale();
        List<PointOfInterest> pois = poiService.getPointsOfInterest(currentLocale);
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
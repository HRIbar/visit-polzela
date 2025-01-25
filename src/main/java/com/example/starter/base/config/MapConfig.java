package com.example.starter.base.config;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.inject.Produces;
import software.xdev.vaadin.maps.leaflet.registry.LComponentManagementRegistry;
import software.xdev.vaadin.maps.leaflet.registry.LDefaultComponentManagementRegistry;
import com.vaadin.flow.component.UI;

@ApplicationScoped
public class MapConfig {

    @Produces
    @ApplicationScoped
    public LComponentManagementRegistry createComponentRegistry() {
        return new LDefaultComponentManagementRegistry(() -> UI.getCurrent().getElement());
    }
}
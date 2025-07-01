package com.example.starter.base;

import com.vaadin.flow.component.page.AppShellConfigurator;
import com.vaadin.flow.component.page.Inline;
import com.vaadin.flow.component.page.Push;
import com.vaadin.flow.server.PWA;
import com.vaadin.flow.theme.Theme;
import com.vaadin.flow.theme.material.Material;
import com.vaadin.flow.server.AppShellSettings;


@Push
@Theme(themeClass = Material.class)
@PWA(
        name = "Visit Polzela Progressive Web Application",
        shortName = "Visit Polzela",
        manifestPath = "manifest.json",
        iconPath = "icons/icon-192x192.ico",
        offlinePath = "offline.html"
)
public class AppShell implements AppShellConfigurator {
    
    @Override
    public void configurePage(AppShellSettings settings) {
        // Add custom service worker registration
        settings.addInlineFromFile("META-INF/resources/sw-register.js", Inline.Wrapping.JAVASCRIPT);
    }
}
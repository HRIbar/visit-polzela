package com.example.starter.base;

import com.vaadin.flow.component.page.AppShellConfigurator;
import com.vaadin.flow.server.PWA;
import com.vaadin.flow.theme.Theme;

@Theme("starter-theme")
@PWA(name = "Visit Polzela Progressive Web Application",
     shortName = "VisitPWA",
     manifestPath = "manifest.json",
     iconPath = "icons/icon.png",
     offlinePath="offline.html")
public class AppShell implements AppShellConfigurator {
    // You can add other configurations here if needed
}
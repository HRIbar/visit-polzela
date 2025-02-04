package com.example.starter.base;

import com.vaadin.flow.component.page.AppShellConfigurator;
import com.vaadin.flow.server.PWA;
import com.vaadin.flow.theme.Theme;
import com.vaadin.flow.theme.material.Material;

@Theme(themeClass = Material.class)
@PWA(
        name = "Visit Polzela Progressive Web Application",
        shortName = "Visit Polzela",
        manifestPath = "manifest.json",
        iconPath = "icons/icon-192x192.ico",
        offlinePath = "offline.html",
        offlineResources = {
                // Images
                "images/logo.png",
                "images/castle1.webp", "images/castle2.webp", "images/castle3.webp",
                "images/park1.webp", "images/park2.webp", "images/park3.webp",
                "images/icecream1.webp", "images/icecream2.webp", "images/icecream3.webp",
                "images/mountoljka1.webp", "images/mountoljka2.webp", "images/mountoljka3.webp",
                "images/maurerhouse1.webp", "images/maurerhouse2.webp", "images/maurerhouse3.webp",
                "images/romancamp1.webp", "images/romancamp2.webp", "images/romancamp3.webp",
                "images/tractormuseum1.webp", "images/tractormuseum2.webp", "images/tractormuseum3.webp",
                "images/cajhnhayrack1.webp", "images/cajhnhayrack2.webp", "images/cajhnhayrack3.webp",
                "images/clayfigurines1.webp", "images/clayfigurines2.webp", "images/clayfigurines3.webp",
                "images/noviklostermanor1.webp", "images/noviklostermanor2.webp", "images/noviklostermanor3.webp",
                "images/stmargharetachurch1.webp", "images/stmargharetachurch2.webp", "images/stmargharetachurch3.webp",
                "images/stnicholaschurch1.webp", "images/stnicholaschurch2.webp", "images/stnicholaschurch3.webp",
                "images/standrewchurch1.webp", "images/standrewchurch2.webp", "images/standrewchurch3.webp",
                "images/plaguememorial1.webp", "images/plaguememorial2.webp", "images/plaguememorial3.webp",
                "images/jelovsekgranary1.webp", "images/jelovsekgranary2.webp", "images/jelovsekgranary3.webp",
                "images/bolcinhouse1.webp", "images/bolcinhouse2.webp", "images/bolcinhouse3.webp",
                "images/stoberhouse1.webp", "images/stoberhouse2.webp", "images/stoberhouse3.webp",
                "images/barbankhouse1.webp", "images/barbankhouse2.webp", "images/barbankhouse3.webp",
                "images/mesicmill1.webp", "images/mesicmill2.webp", "images/mesicmill3.webp",
                "images/riverloznica1.webp", "images/riverloznica2.webp", "images/riverloznica3.webp",

                // Styles
                "styles/offline.css",
                "styles/main.css",
                "main-view-styles.css",

                // Scripts
                "scripts/offline.js",
                "scripts/main.js",

                // Icons
                "icons/icon-192x192.ico",
                "icons/icon-512x512.ico",

                // Other resources
                "manifest.json",
                "offline.html",
                "index.html",

                // Add any other resources you want to be available offline
        }
)
public class AppShell implements AppShellConfigurator {
        // You can add other configurations here if needed
}
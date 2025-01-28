package com.example.starter.base;

import com.vaadin.flow.component.page.AppShellConfigurator;
import com.vaadin.flow.server.PWA;
import com.vaadin.flow.theme.Theme;

@Theme("starter-theme")
@PWA(
        name = "Visit Polzela Progressive Web Application",
        shortName = "Visit Polzela",
        manifestPath = "manifest.json",
        iconPath = "icons/icon-192x192.ico",
        offlinePath = "offline.html",
        offlineResources = {
                // Images
                "images/logo.png",
                "images/castle1.jpg", "images/castle2.jpg", "images/castle3.jpg",
                "images/park1.jpg", "images/park2.jpg", "images/park3.jpg",
                "images/icecream1.jpg", "images/icecream2.jpg", "images/icecream3.jpg",
                "images/mountoljka1.jpg", "images/mountoljka2.jpg", "images/mountoljka3.jpg",
                "images/maurerhouse1.jpg", "images/maurerhouse2.jpg", "images/maurerhouse3.jpg",
                "images/romancamp1.jpg", "images/romancamp2.jpg", "images/romancamp3.jpg",
                "images/tractormuseum1.jpg", "images/tractormuseum2.jpg", "images/tractormuseum3.jpg",
                "images/cajhnhayrack1.jpg", "images/cajhnhayrack2.jpg", "images/cajhnhayrack3.jpg",
                "images/clayfigurines1.jpg", "images/clayfigurines2.jpg", "images/clayfigurines3.jpg",
                "images/noviklostermanor1.jpg", "images/noviklostermanor2.jpg", "images/noviklostermanor3.jpg",
                "images/stmargharetachurch1.jpg", "images/stmargharetachurch2.jpg", "images/stmargharetachurch3.jpg",
                "images/stnicholaschurch1.jpg", "images/stnicholaschurch2.jpg", "images/stnicholaschurch3.jpg",
                "images/standrewchurch1.jpg", "images/standrewchurch2.jpg", "images/standrewchurch3.jpg",
                "images/plaguememorial1.jpg", "images/plaguememorial2.jpg", "images/plaguememorial3.jpg",
                "images/jelovsekgranary1.jpg", "images/jelovsekgranary2.jpg", "images/jelovsekgranary3.jpg",
                "images/bolcinhouse1.jpg", "images/bolcinhouse2.jpg", "images/bolcinhouse3.jpg",
                "images/stoberhouse1.jpg", "images/stoberhouse2.jpg", "images/stoberhouse3.jpg",
                "images/barbankhouse1.jpg", "images/barbankhouse2.jpg", "images/barbankhouse3.jpg",
                "images/mesicmill1.jpg", "images/mesicmill2.jpg", "images/mesicmill3.jpg",
                "images/riverloznica1.jpg", "images/riverloznica2.jpg", "images/riverloznica3.jpg",

                // Styles
                "styles/offline.css",
                "styles/main.css",

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
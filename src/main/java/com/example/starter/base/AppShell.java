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
                "images/polzela.webp",
                "images/grbpolzela.webp",
                "images/placeholder.png",
                
                // POI main images
                "images/castle.webp",
                "images/park.webp",
                "images/icecream.webp",
                "images/mountoljka.webp",
                "images/maurerhouse.webp",
                "images/romancamp.webp",
                "images/tractormuseum.webp",
                "images/cajhnhayrack.webp",
                "images/clayfigurines.webp",
                "images/noviklostermanor.webp",
                "images/stmargharetachurch.webp",
                "images/stnicholaschurch.webp",
                "images/standrewchurch.webp",
                "images/plaguememorial.webp",
                "images/jelovsekgranary.webp",
                "images/bolcinhouse.webp",
                "images/stoberhouse.webp",
                "images/barbankhouse.webp",
                "images/mesicmill.webp",
                "images/riverloznica.webp",
                
                // POI detail images
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
                
                // Icons
                "icons/icon-192x192.ico",
                "icons/icon-512x512.ico",
                
                // Styles
                "styles/offline.css",
                "styles/main.css",
                "styles/main-view-styles.css",
                "styles/poi-detail-view-styles.css",
                
                // POI descriptions
                "poi-descriptions/castle.txt",
                "poi-descriptions/park.txt",
                "poi-descriptions/icecream.txt",
                "poi-descriptions/mountoljka.txt",
                "poi-descriptions/maurerhouse.txt",
                "poi-descriptions/romancamp.txt",
                "poi-descriptions/tractormuseum.txt",
                "poi-descriptions/cajhnhayrack.txt",
                "poi-descriptions/clayfigurines.txt",
                "poi-descriptions/noviklostermanor.txt",
                "poi-descriptions/stmargharetachurch.txt",
                "poi-descriptions/stnicholaschurch.txt",
                "poi-descriptions/standrewchurch.txt",
                "poi-descriptions/plaguememorial.txt",
                "poi-descriptions/jelovsekgranary.txt",
                "poi-descriptions/bolcinhouse.txt",
                "poi-descriptions/stoberhouse.txt",
                "poi-descriptions/barbankhouse.txt",
                "poi-descriptions/mesicmill.txt",
                "poi-descriptions/riverloznica.txt",
                
                // Other resources
                "manifest.json",
                "offline.html",
                "index.html",
                "pointsofinterest/pois.txt"
        }
)
public class AppShell implements AppShellConfigurator {
        // You can add other configurations here if needed
}
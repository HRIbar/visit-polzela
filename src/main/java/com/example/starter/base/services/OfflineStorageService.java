package com.example.starter.base.services;

import com.example.starter.base.entity.PointOfInterest;
import com.vaadin.flow.component.UI;
import com.vaadin.flow.component.page.PendingJavaScriptResult;
import jakarta.enterprise.context.ApplicationScoped;
import elemental.json.JsonArray;
import elemental.json.JsonObject;
import elemental.json.impl.JreJsonFactory;

import java.util.List;

@ApplicationScoped
public class OfflineStorageService {
    
    private final JreJsonFactory jsonFactory = new JreJsonFactory();
    
    /**
     * Stores POI data in IndexedDB for offline use
     */
    public void storePOIs(List<PointOfInterest> pois) {
        if (UI.getCurrent() == null) return;
        
        JsonArray poisArray = convertPOIsToJsonArray(pois);
        
        UI.getCurrent().getPage().executeJs(
            "if ('indexedDB' in window) {" +
            "  const dbPromise = indexedDB.open('visit-polzela-db', 1, upgradeDB => {" +
            "    if (!upgradeDB.objectStoreNames.contains('pois')) {" +
            "      upgradeDB.createObjectStore('pois', {keyPath: 'id'});" +
            "    }" +
            "  });" +
            "  dbPromise.then(db => {" +
            "    const tx = db.transaction('pois', 'readwrite');" +
            "    const store = tx.objectStore('pois');" +
            "    const pois = $0;" +
            "    for (let i = 0; i < pois.length; i++) {" +
            "      store.put(pois[i]);" +
            "    }" +
            "    return tx.complete;" +
            "  });" +
            "}", poisArray);
    }
    
    /**
     * Retrieves POI data from IndexedDB when offline
     */
    public PendingJavaScriptResult getPOIs() {
        if (UI.getCurrent() == null) return null;
        
        return UI.getCurrent().getPage().executeJs(
            "return new Promise((resolve, reject) => {" +
            "  if ('indexedDB' in window) {" +
            "    const dbPromise = indexedDB.open('visit-polzela-db', 1);" +
            "    dbPromise.then(db => {" +
            "      const tx = db.transaction('pois', 'readonly');" +
            "      const store = tx.objectStore('pois');" +
            "      return store.getAll();" +
            "    }).then(pois => {" +
            "      resolve(pois);" +
            "    }).catch(error => {" +
            "      resolve([]);" +
            "    });" +
            "  } else {" +
            "    resolve([]);" +
            "  }" +
            "});"
        );
    }
    
    /**
     * Checks if the application is currently online
     */
    public PendingJavaScriptResult isOnline() {
        if (UI.getCurrent() == null) return null;
        
        return UI.getCurrent().getPage().executeJs("return navigator.onLine;");
    }
    
    /**
     * Converts POI objects to JSON array for storage
     */
    private JsonArray convertPOIsToJsonArray(List<PointOfInterest> pois) {
        JsonArray array = jsonFactory.createArray();
        
        for (int i = 0; i < pois.size(); i++) {
            PointOfInterest poi = pois.get(i);
            JsonObject poiJson = jsonFactory.createObject();
            
            poiJson.put("id", poi.getName());
            poiJson.put("name", poi.getName());
            poiJson.put("description", poi.getDescription());
            poiJson.put("mainImagePath", poi.getImagePath());
            poiJson.put("mapUrl", poi.getMapUrl());
            poiJson.put("navigationUrl", poi.getNavigationUrl());

            
            array.set(i, poiJson);
        }
        
        return array;
    }
}
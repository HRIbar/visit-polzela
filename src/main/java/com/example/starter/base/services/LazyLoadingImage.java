package com.example.starter.base.services;

import com.vaadin.flow.component.Tag;
import com.vaadin.flow.component.dependency.JsModule;
import com.vaadin.flow.component.dependency.NpmPackage;
import com.vaadin.flow.component.html.Image;
import com.vaadin.flow.component.littemplate.LitTemplate;
import com.vaadin.flow.component.template.Id;

@NpmPackage(value = "@vaadin/vaadin-lumo-styles", version = "23.2.0-alpha2")
@JsModule("./components/lazy-loading-image.js")
@Tag("lazy-loading-image")
public class LazyLoadingImage extends LitTemplate {
    @Id("image")
    private Image image;

    public LazyLoadingImage() {
        // Default constructor
    }

    public LazyLoadingImage(String src, String alt) {
        setSrc(src);
        setAlt(alt);
    }

    public void setSrc(String src) {
        image.setSrc(src);
    }

    public void setAlt(String alt) {
        image.setAlt(alt);
    }

    public void addClassName(String className) {
        image.addClassName(className);
    }

    public void addEventListener(String eventType, com.vaadin.flow.dom.DomEventListener listener) {
        image.getElement().addEventListener(eventType, listener);
    }
}

package com.example.starter.base.services;


import com.example.starter.base.entity.PointOfInterest;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;

@ApplicationScoped
public class POIService {
    public List<PointOfInterest> getPointsOfInterest() {
        return List.of(
                new PointOfInterest("Polzela Castle", "Historic castle in Polzela.", "images/castle.jpg", "https://maps.app.goo.gl/..."),
                new PointOfInterest("Local Park", "A serene park perfect for relaxation.", "images/park.jpg", "https://maps.app.goo.gl/..."),
                new PointOfInterest("Ice Cream Seller", "Delicious local ice cream.", "images/icecream.jpg", "https://maps.app.goo.gl/...")
        );
    }
}

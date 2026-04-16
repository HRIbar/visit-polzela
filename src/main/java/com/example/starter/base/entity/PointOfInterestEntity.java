package com.example.starter.base.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "point_of_interest")
public class PointOfInterestEntity extends PanacheEntityBase {

    @Id
    @Column(name = "poi_key", length = 64)
    public String key;

    @Column(name = "short_description")
    public String shortDescription;

    @Column(name = "display_order")
    public int displayOrder;

    @Column(name = "osm_url", length = 512)
    public String osmUrl;

    @Column(name = "google_maps_url", length = 512)
    public String googleMapsUrl;

    @Column(name = "apple_maps_url", length = 512)
    public String appleMapsUrl;

    @OneToMany(mappedBy = "poi", fetch = FetchType.LAZY)
    public List<POITranslationEntity> translations;

    @OneToMany(mappedBy = "poi", fetch = FetchType.LAZY)
    @OrderBy("sortOrder ASC")
    public List<POIImageEntity> images;

    public static List<PointOfInterestEntity> findAllOrdered() {
        return list("ORDER BY displayOrder");
    }
}


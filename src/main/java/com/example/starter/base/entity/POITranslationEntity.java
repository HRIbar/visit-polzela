package com.example.starter.base.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;

@Entity
@Table(name = "poi_translation")
public class POITranslationEntity extends PanacheEntityBase {

    @EmbeddedId
    public POITranslationId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "poi_key", insertable = false, updatable = false)
    public PointOfInterestEntity poi;

    @Column(name = "display_name")
    public String displayName;

    @Column(name = "description", columnDefinition = "TEXT")
    public String description;
}


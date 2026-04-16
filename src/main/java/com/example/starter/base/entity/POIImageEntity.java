package com.example.starter.base.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;

@Entity
@Table(name = "poi_image")
public class POIImageEntity extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "poi_key")
    public PointOfInterestEntity poi;

    @Column(name = "image_path", length = 256)
    public String imagePath;

    @Column(name = "sort_order")
    public int sortOrder;
}


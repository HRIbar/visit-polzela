package com.example.starter.base.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;

@Entity
@Table(name = "ui_text")
public class UITextEntity extends PanacheEntityBase {

    @EmbeddedId
    public UITextId id;

    @Column(name = "value")
    public String value;
}


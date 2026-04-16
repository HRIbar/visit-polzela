Plan: Migrate POI Data from Files to PostgreSQL
Replace file-based POI storage with PostgreSQL using Quarkus Hibernate ORM with Panache and Flyway. Images stay as static .webp files — only their URL paths are stored in the DB. The REST API contract is unchanged, so the frontend and mobile app require zero modifications. Local dev uses Docker Compose for Postgres; production uses Fly.io managed Postgres with %prod.quarkus.datasource.jdbc.url=jdbc:${DATABASE_URL}.
Steps
Add Maven dependencies to pom.xml — add quarkus-hibernate-orm-panache, quarkus-jdbc-postgresql, and quarkus-flyway to <dependencies>.
Configure datasource in application.properties — add:
%dev.quarkus.datasource.db-kind=postgresql, %dev.quarkus.datasource.jdbc.url=jdbc:postgresql://localhost:5432/visitpolzela, %dev.quarkus.datasource.username/password=postgres
%prod.quarkus.datasource.db-kind=postgresql, %prod.quarkus.datasource.jdbc.url=jdbc:${DATABASE_URL}
quarkus.hibernate-orm.database.generation=none
quarkus.flyway.migrate-at-start=true
Add POST,PUT,DELETE to quarkus.http.cors.methods for future admin panel
Create docker-compose.yml at project root — single postgres:16-alpine service exposing port 5432, database visitpolzela, user/password postgres/postgres. Add a named volume for data persistence.
Create JPA entities in src/main/java/com/example/starter/base/entity/:
PointOfInterestEntity — @Id String key, String shortDescription, int displayOrder, String osmUrl, String googleMapsUrl, String appleMapsUrl; @OneToMany to translations and images
POITranslationEntity — @EmbeddedId(poiKey, lang), String displayName, @Column(columnDefinition="TEXT") String description
POIImageEntity — @Id @GeneratedValue Long id, @ManyToOne PointOfInterestEntity poi, String imagePath, int sortOrder
UITextEntity — @EmbeddedId(key, lang), String value (for welcome, takeme)
Create Flyway migration src/main/resources/db/migration/V1__init_schema.sql — this is the source of truth. Contains DDL for the 4 tables, then INSERT statements seeding:
17 POI rows from pois.txt (with displayOrder 0–16)
17×4 = 68 translation rows from poititles.txt + poi-descriptions/*.txt (inline full description text as string literals)
Image path rows derived from the existing images/ directory listing (e.g., castle → /images/castle.webp, /images/castle1.webp, /images/castle2.webp, /images/castle3.webp with sortOrder 0–3)
2×4 = 8 UI text rows for welcome and takeme in 4 languages
Rewrite POIService.java — replace all file I/O with EntityManager or Panache repository queries:
getLocalizedPOIsDto(lang) → query PointOfInterestEntity joined with POITranslationEntity filtered by lang, ordered by displayOrder; map to POIDto (leave description empty)
getLocalizedPOIDto(key, lang) → same join but filtered by key, include description from POITranslationEntity
getPOIImageUrls(key) → query POIImageEntity where poi.key = key ordered by sortOrder, return imagePath list
getLocalizedTexts(lang, keys) → query UITextEntity filtered by lang and optionally by key IN (...), return as Map<String,String>
Remove the titlesCache HashMap and all InputStream/BufferedReader file-reading code
Keep all REST endpoints and DTOs unchanged — POIResource.java, TextResource.java, POIDto.java, POIImagesDto.java, and LocalizedTextDto.java stay as-is. No frontend or mobile changes.
Keep old data files as reference — pois.txt, poititles.txt, and poi-descriptions/*.txt remain in the repo untouched but are no longer read at runtime. The source of truth is now V1__init_schema.sql. Future POI additions become new Flyway migrations (e.g., V2__add_new_poi.sql).
No changes to Dockerfile or fly.toml — Flyway runs at app startup, not build time. DATABASE_URL is injected by Fly.io at runtime.
Provision Fly.io Postgres — document the commands:
fly postgres create --name visit-polzela-db --region fra
fly postgres attach visit-polzela-db --app visit-polzela-bwsl9a
This auto-sets DATABASE_URL as a secret on the app
Do NOT modify
Any files under src/main/frontend/, android/, vite.mobile.config.ts, or capacitor.config.ts
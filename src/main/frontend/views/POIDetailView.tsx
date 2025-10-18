import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { POI, Language } from '../types/POI';
import { DataService } from '../services/DataService';
import { useLanguage } from '../contexts/LanguageContext';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/poi-detail-view-styles.css';

// Fix Leaflet default marker icon issue in bundled apps
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

export default function POIDetailView() {
  const { name } = useParams<{ name: string }>();
  const [poi, setPoi] = useState<POI | null>(null);
  const { language } = useLanguage();
  const [description, setDescription] = useState<string>('');
  const [takeMeText, setTakeMeText] = useState<string>('Take me there!');
  const [loading, setLoading] = useState(true);
  const dataService = DataService.getInstance();

  useEffect(() => {
    if (name) {
      loadPOI(name);
    }
  }, [name, language]);

  const loadPOI = async (poiName: string) => {
    try {
      setLoading(true);
      const poiData = await dataService.getPOIByName(decodeURIComponent(poiName));

      if (poiData) {
        // Get localized title
        const localizedPOIs = await dataService.getPOIsWithLocalizedTitles(language);
        const localizedPOI = localizedPOIs.find(p => p.name === poiData.name);

        setPoi(localizedPOI || poiData);

        // Load description
        const desc = await loadDescription(poiData.name);
        setDescription(desc);

        // Get localized "Take me there!" text
        const takeMe = await dataService.getLocalizedText('takeme', language);
        setTakeMeText(takeMe);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading POI:', error);
      setLoading(false);
    }
  };

  const loadDescription = async (poiName: string): Promise<string> => {
    try {
      const response = await fetch(`/poi-descriptions/${poiName}.txt`);
      if (!response.ok) {
        return 'Description not available.';
      }

      const text = await response.text();
      const lines = text.split('\n');
      const langPrefix = `${language}:`;

      // Look for language-specific description
      const langLine = lines.find(line => line.startsWith(langPrefix));
      if (langLine) {
        return langLine.substring(langPrefix.length).trim();
      }

      // Fallback to English
      const enLine = lines.find(line => line.startsWith('EN:'));
      if (enLine) {
        return enLine.substring(3).trim();
      }

      return 'Description not available in the selected language.';
    } catch (error) {
      console.error('Error loading description:', error);
      return 'Error loading description.';
    }
  };

  const parseCoordinates = (mapUrl: string): { lat: number; lng: number } => {
    try {
      const parts = mapUrl.split('/');
      if (parts.length >= 2) {
        const lat = parseFloat(parts[parts.length - 2]);
        const lng = parseFloat(parts[parts.length - 1]);
        return { lat, lng };
      }
    } catch (error) {
      console.error('Error parsing coordinates:', error);
    }
    return { lat: 46.2803, lng: 15.0726 }; // Default to Polzela center
  };

  const NavigationButton = ({
    imagePath,
    altText,
    url
  }: {
    imagePath: string;
    altText: string;
    url: string;
  }) => (
    <a
      href={url}
      className="navigation-button-container"
      style={{
        position: 'relative',
        display: 'inline-block',
        cursor: 'pointer',
        textDecoration: 'none'
      }}
    >
      <img src={imagePath} alt={altText} className="navigate-button" />
      <h2
        className="navigation-overlay-text"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          margin: '0',
          color: 'black',
          fontWeight: 'bold',
          pointerEvents: 'none',
          fontSize: '2.5em',
          textAlign: 'center'
        }}
      >
        {takeMeText}
      </h2>
    </a>
  );

  const ImageGallery = ({ poi }: { poi: POI }) => {
    const basePath = poi.imagePath.replace('.webp', '');
    const [enlargedImage, setEnlargedImage] = useState<string | null>(null);

    return (
      <>
        <div className="image-gallery">
          {[1, 2, 3].map(i => (
            <img
              key={i}
              src={`/images/${poi.name}${i}.webp`}
              alt={poi.displayName}
              className="gallery-image"
              onClick={() => setEnlargedImage(`/images/${poi.name}${i}.webp`)}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ))}
        </div>

        {enlargedImage && (
          <div className="image-dialog" onClick={() => setEnlargedImage(null)}>
            <img
              src={enlargedImage}
              alt={poi.displayName}
              className="enlarged-image"
              onClick={() => setEnlargedImage(null)}
            />
          </div>
        )}
      </>
    );
  };

  const MapComponent = ({ poi }: { poi: POI }) => {
    const mapRef = React.useRef<HTMLDivElement>(null);
    const mapInstanceRef = React.useRef<L.Map | null>(null);
    const { lat, lng } = parseCoordinates(poi.mapUrl);

    useEffect(() => {
      // Wait for DOM to be ready
      const initMap = () => {
        if (!mapRef.current) {
          return;
        }

        // Clean up existing map instance
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        try {
          // Create map with mobile-specific options
          const map = L.map(mapRef.current, {
            center: [lat, lng],
            zoom: 15,
            zoomControl: true,
            attributionControl: true,
            // Mobile-specific options
            tap: true,
            dragging: true,
            touchZoom: true,
            scrollWheelZoom: false
          });

          // Add tile layer with error handling
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
            crossOrigin: true
          }).addTo(map);

          // Add marker
          L.marker([lat, lng]).addTo(map).bindPopup(poi.displayName).openPopup();

          // Force map to recalculate size (critical for mobile)
          setTimeout(() => {
            map.invalidateSize();
          }, 100);

          mapInstanceRef.current = map;
        } catch (error) {
          console.error('Error initializing map:', error);
        }
      };

      // Delay initialization to ensure DOM is ready
      const timer = setTimeout(initMap, 250);

      return () => {
        clearTimeout(timer);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
      };
    }, [lat, lng, poi.displayName]);

    return (
      <div
        ref={mapRef}
        className="poi-map"
        style={{
          width: '100%',
          height: '400px',
          zIndex: 0
        }}
      />
    );
  };

  if (loading) {
    return (
      <div className="poi-detail-content">
        <div>Loading...</div>
      </div>
    );
  }

  if (!poi) {
    return (
      <div className="poi-detail-content">
        <h2>Point of Interest not found</h2>
      </div>
    );
  }

  return (
    <div className="poi-detail-content">
      <h2 className="poi-title">{poi.displayName}</h2>

      <img
        src={poi.imagePath}
        alt={poi.displayName}
        className="poi-main-image"
      />

      <div className="poi-description">
        {description.split('\n\n').map((paragraph, index) => (
          <p key={index} style={{ whiteSpace: 'pre-wrap', maxWidth: '800px' }}>
            {paragraph}
          </p>
        ))}
      </div>

      <ImageGallery poi={poi} />

      <NavigationButton
        imagePath="/images/navigationbutton.webp"
        altText="Navigate with Google Maps"
        url={poi.navigationUrl}
      />

      {poi.appleNavigationUrl && poi.appleNavigationUrl !== poi.navigationUrl && (
        <NavigationButton
          imagePath="/images/applenavigationbutton.webp"
          altText="Navigate with Apple Maps"
          url={poi.appleNavigationUrl}
        />
      )}

      <MapComponent poi={poi} />
    </div>
  );
}

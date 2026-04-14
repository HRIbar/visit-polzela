import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { POI, Language } from '../types/POI';
import { DataService } from '../services/DataService';
import { SEO } from '../components/SEO';
import { generatePOISchema, generateBreadcrumbSchema } from '../utils/seoHelpers';
import '../styles/poi-detail-view-styles.css';

const dataService = DataService.getInstance();

export default function POIDetailView() {
  const { name } = useParams<{ name: string }>();
  const [poi, setPoi] = useState<POI | null>(null);
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('selectedLanguage') as Language) || 'EN';
  });
  const [description, setDescription] = useState<string>('');
  const [takeMeText, setTakeMeText] = useState<string>('Take me there!');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (name) {
      loadPOI(name);
    }
  }, [name, language]);

  const loadPOI = async (poiName: string) => {
    try {
      setLoading(true);
      // Fetch POI with full localized description from REST
      const poiData = await dataService.getPOIFromREST(decodeURIComponent(poiName), language);

      if (poiData) {
        setPoi(poiData);
        // Description is included in the REST response
        setDescription(poiData.description || '');

        // Fetch localized "Take me there!" text
        const texts = await dataService.getLocalizedTexts(language, ['takeme']);
        setTakeMeText(texts.get('takeme') || 'Take me there!');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading POI:', error);
      setLoading(false);
    }
  };

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    localStorage.setItem('selectedLanguage', newLanguage);
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
    >
      <img src={imagePath} alt={altText} className="navigate-button" />
      <h2 className="navigation-overlay-text">
        {takeMeText}
      </h2>
    </a>
  );

  const ImageGallery = ({ poi }: { poi: POI }) => {
    const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
    const [enlargedImage, setEnlargedImage] = useState<string | null>(null);

    useEffect(() => {
      dataService.getPOIImages(poi.name).then(allUrls => {
        // Gallery images are the numbered ones (exclude the main image)
        setGalleryUrls(allUrls.filter(url => /\d\.webp$/.test(url)));
      });
    }, [poi.name]);

    return (
      <>
        <div className="image-gallery">
          {galleryUrls.map((url, i) => (
            <img
              key={i}
              src={url}
              alt={poi.displayName}
              className="gallery-image"
              onClick={() => setEnlargedImage(url)}
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
    const { lat, lng } = parseCoordinates(poi.mapUrl);

    useEffect(() => {
      let map: any;

      if (mapRef.current && (window as any).L) {
        const L = (window as any).L;
        map = L.map(mapRef.current).setView([lat, lng], 15);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        L.marker([lat, lng]).addTo(map).bindPopup(poi.displayName).openPopup();
      }

      return () => {
        if (map) {
          map.remove();
        }
      };
    }, [lat, lng, poi.displayName]);

    return <div ref={mapRef} className="poi-map" />;
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
      {/* Language flags and back button */}
      <div className="flag-layout">
        <Link to="/" className="back-button">← Back</Link>
        <div className="flags-container">
          <img
            src="/images/siflag.webp"
            alt="SI Flag"
            className={`small-flag ${language === 'SL' ? 'active-flag' : ''}`}
            onClick={() => handleLanguageChange('SL')}
          />
          <img
            src="/images/ukflag.webp"
            alt="UK Flag"
            className={`small-flag ${language === 'EN' ? 'active-flag' : ''}`}
            onClick={() => handleLanguageChange('EN')}
          />
          <img
            src="/images/deflag.webp"
            alt="DE Flag"
            className={`small-flag ${language === 'DE' ? 'active-flag' : ''}`}
            onClick={() => handleLanguageChange('DE')}
          />
          <img
            src="/images/nlflag.webp"
            alt="NL Flag"
            className={`small-flag ${language === 'NL' ? 'active-flag' : ''}`}
            onClick={() => handleLanguageChange('NL')}
          />
        </div>
      </div>

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

      <MapComponent poi={poi} />
    </div>
  );
}

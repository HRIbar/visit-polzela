import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { POI, Language } from '../types/POI';
import { DataService } from '../services/DataService';
import { SEO } from '../components/SEO';
import { generateOrganizationSchema, generatePOIListSchema } from '../utils/seoHelpers';
import '../styles/main-view-styles.css';

export default function MainView() {
  const [pois, setPois] = useState<POI[]>([]);
  const [language, setLanguage] = useState<Language>('EN');
  const [loading, setLoading] = useState(true);
  const [welcomeText, setWelcomeText] = useState<string>('Welcome to');
  const [showInstallButton, setShowInstallButton] = useState(true);
  const dataService = DataService.getInstance();

  useEffect(() => {
    initializeApp();

    // Load saved language from localStorage
    const savedLanguage = localStorage.getItem('selectedLanguage') as Language;
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }

    // Check if app is already in standalone mode (already installed)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallButton(false);
    }

    // Listen for the appinstalled event to hide button after installation
    const handleAppInstalled = () => {
      setShowInstallButton(false);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  useEffect(() => {
    if (!loading) {
      loadPOIs();
      loadWelcomeText();
    }
  }, [language, loading]);

  const initializeApp = async () => {
    try {
      await dataService.initializeData();
      setLoading(false);
    } catch (error) {
      console.error('Error initializing app:', error);
      setLoading(false);
    }
  };

  const loadPOIs = async () => {
    try {
      const localizedPOIs = await dataService.getPOIsWithLocalizedTitles(language);
      setPois(localizedPOIs);
    } catch (error) {
      console.error('Error loading POIs:', error);
    }
  };

  const loadWelcomeText = async () => {
    try {
      const text = await dataService.getLocalizedText('welcome', language);
      setWelcomeText(text);
    } catch (error) {
      console.error('Error loading welcome text:', error);
    }
  };

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    // Save language selection to localStorage
    localStorage.setItem('selectedLanguage', newLanguage);
  };

  const installPWA = async () => {
    const deferredPrompt = (window as any).deferredPrompt;

    if (!deferredPrompt) {
      // Check if already in standalone mode
      if (window.matchMedia('(display-mode: standalone)').matches) {
        alert('App is already installed!');
        setShowInstallButton(false);
        return;
      }

      // Provide platform-specific instructions
      const userAgent = navigator.userAgent.toLowerCase();
      let message = 'To install this app:\n\n';

      if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
        message += 'On iOS:\n1. Tap the Share button\n2. Scroll down and tap "Add to Home Screen"';
      } else if (userAgent.includes('android')) {
        message += 'On Android:\n1. Tap the menu (⋮)\n2. Tap "Install app" or "Add to Home screen"';
      } else {
        message += 'Look for the install button in your browser\'s address bar or menu.';
      }

      alert(message);
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    // Clear the deferredPrompt so it can only be used once
    (window as any).deferredPrompt = null;
  };

  if (loading) {
    return <div className="main-content">Loading...</div>;
  }

  // Generate SEO content based on selected language
  const seoTitles = {
    EN: 'Visit Polzela - Discover Slovenia Tourist Attractions & Points of Interest',
    SL: 'Obiščite Polzelo - Odkrijte turistične znamenitosti Slovenije',
    DE: 'Besuchen Sie Polzela - Entdecken Sie Touristenattraktionen in Slowenien',
    NL: 'Bezoek Polzela - Ontdek toeristische attracties in Slovenië'
  };

  const seoDescriptions = {
    EN: 'Explore Polzela, Slovenia - your offline guide to historic castles, churches, museums, and natural attractions. Download the app for offline access to maps and directions.',
    SL: 'Raziščite Polzelo, Slovenija - vaš vodnik za zgodovinske gradove, cerkve, muzeje in naravne znamenitosti. Prenesite aplikacijo za dostop brez povezave.',
    DE: 'Erkunden Sie Polzela, Slowenien - Ihr Offline-Reiseführer zu historischen Burgen, Kirchen, Museen und Naturattraktionen.',
    NL: 'Verken Polzela, Slovenië - uw offline gids voor historische kastelen, kerken, musea en natuurlijke attracties.'
  };

  const localeMap = {
    EN: 'en_US',
    SL: 'sl_SI',
    DE: 'de_DE',
    NL: 'nl_NL'
  };

  const alternateLocales = Object.values(localeMap).filter(loc => loc !== localeMap[language]);

  // Generate structured data
  const organizationSchema = generateOrganizationSchema();
  const poiListSchema = generatePOIListSchema(pois);
  const combinedSchema = {
    '@context': 'https://schema.org',
    '@graph': [organizationSchema, poiListSchema]
  };

  return (
    <div className="main-content">
      <SEO
        title={seoTitles[language]}
        description={seoDescriptions[language]}
        canonicalUrl="/"
        locale={localeMap[language]}
        alternateLocales={alternateLocales}
        structuredData={combinedSchema}
        image="/images/polzela.webp"
      />
      {/* Language flags and install button */}
      <div className="flag-layout">
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
        {showInstallButton && (
          <button onClick={installPWA} className="install-button">
            <img src="/icons/icon-192x192.ico" alt="Install" className="install-icon" />
            Install Application
          </button>
        )}
      </div>

      {/* Welcome section */}
      <div className="welcome-container">
        <div className="title-div">
          <div className="header-layout">
            <h2 className="welcome-text">{welcomeText}</h2>
            <img src="/images/grbpolzela.webp" alt="Polzela Coat of Arms" className="grb-image" />
          </div>
        </div>
      </div>

      {/* Title image */}
      <div className="title-container">
        <div className="title-image-container">
          <img src="/images/polzela.webp" alt="Polzela panorama" className="title-image" />
        </div>
      </div>

      {/* POI grid */}
      <div className="poi-container">
        {pois.map(poi => (
          <Link key={poi.name} to={`/poi/${encodeURIComponent(poi.name)}`} className="poi-link">
            <div className="poi-item">
              <h2 className="poi-title">{poi.displayName}</h2>
              <img
                src={poi.imagePath}
                alt={poi.displayName}
                className="poi-image"
                loading="lazy"
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

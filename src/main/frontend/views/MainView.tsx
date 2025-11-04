import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { POI, Language } from '../types/POI';
import { DataService } from '../services/DataService';
import '../styles/main-view-styles.css';

export default function MainView() {
  const [pois, setPois] = useState<POI[]>([]);
  const [language, setLanguage] = useState<Language>('EN');
  const [loading, setLoading] = useState(true);
  const [welcomeText, setWelcomeText] = useState<string>('Welcome to');
  const [showInstallButton, setShowInstallButton] = useState(false);
  const dataService = DataService.getInstance();

  useEffect(() => {
    initializeApp();

    // Check if install prompt is available
    if ((window as any).deferredPrompt) {
      setShowInstallButton(true);
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstall = () => {
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
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
  };

  const installPWA = async () => {
    const deferredPrompt = (window as any).deferredPrompt;

    if (!deferredPrompt) {
      console.log('Install prompt not available');
      // App is likely already installed or browser doesn't support it
      alert('App is already installed or your browser does not support installation.');
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
    setShowInstallButton(false);
  };

  if (loading) {
    return <div className="main-content">Loading...</div>;
  }

  return (
    <div className="main-content">
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

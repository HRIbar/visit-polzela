import { POI } from '../types/POI';

/**
 * Generate Organization structured data for the main page
 */
export const generateOrganizationSchema = () => {
  const siteUrl = typeof globalThis.window === 'undefined' ? '' : globalThis.window.location.origin;

  return {
    '@context': 'https://schema.org',
    '@type': 'TouristInformationCenter',
    name: 'Visit Polzela',
    description: 'Discover the beautiful attractions and points of interest in Polzela, Slovenia',
    url: siteUrl,
    logo: `${siteUrl}/icons/icon-512x512.ico`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Polzela',
      addressCountry: 'SI'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 46.2803,
      longitude: 15.0726
    }
  };
};

/**
 * Generate TouristAttraction structured data for POI detail pages
 */
export const generatePOISchema = (poi: POI, description: string, language: string) => {
  const siteUrl = typeof globalThis.window === 'undefined' ? '' : globalThis.window.location.origin;

  // Parse coordinates from mapUrl
  const coords = parseCoordinatesFromMapUrl(poi.mapUrl);

  return {
    '@context': 'https://schema.org',
    '@type': 'TouristAttraction',
    name: poi.displayName,
    description: description || poi.description,
    url: `${siteUrl}/poi/${encodeURIComponent(poi.name)}`,
    image: `${siteUrl}${poi.imagePath}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Polzela',
      addressCountry: 'SI'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: coords.lat,
      longitude: coords.lng
    },
    hasMap: poi.mapUrl,
    inLanguage: language.toLowerCase()
  };
};

/**
 * Generate BreadcrumbList structured data
 */
export const generateBreadcrumbSchema = (items: { name: string; url: string }[]) => {
  const siteUrl = typeof globalThis.window === 'undefined' ? '' : globalThis.window.location.origin;

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${siteUrl}${item.url}`
    }))
  };
};

/**
 * Generate ItemList structured data for the main page POI list
 */
export const generatePOIListSchema = (pois: POI[]) => {
  const siteUrl = typeof globalThis.window === 'undefined' ? '' : globalThis.window.location.origin;

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Points of Interest in Polzela',
    description: 'A collection of tourist attractions and points of interest in Polzela, Slovenia',
    itemListElement: pois.map((poi, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'TouristAttraction',
        name: poi.displayName,
        url: `${siteUrl}/poi/${encodeURIComponent(poi.name)}`,
        image: `${siteUrl}${poi.imagePath}`
      }
    }))
  };
};

/**
 * Helper function to parse coordinates from map URL
 */
const parseCoordinatesFromMapUrl = (mapUrl: string): { lat: number; lng: number } => {
  try {
    const parts = mapUrl.split('/');
    if (parts.length >= 2) {
      const lat = Number.parseFloat(parts[parts.length - 2]);
      const lng = Number.parseFloat(parts[parts.length - 1]);
      if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
        return { lat, lng };
      }
    }
  } catch (error) {
    console.error('Error parsing coordinates:', error);
  }
  // Default to Polzela center
  return { lat: 46.2803, lng: 15.0726 };
};


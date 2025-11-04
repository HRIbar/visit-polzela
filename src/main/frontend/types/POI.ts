export interface POI {
  name: string;
  displayName: string;
  description: string;
  imagePath: string;
  mapUrl: string;
  navigationUrl: string;
  appleNavigationUrl: string;
  order: number;
}

export interface POITitle {
  name: string;
  en: string;
  sl: string;
  de: string;
  nl: string;
}

export type Language = 'EN' | 'SL' | 'DE' | 'NL';

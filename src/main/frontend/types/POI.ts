export interface POI {
  name: string;
  displayName: string;
  shortDescription: string;
  /** Full long description (populated from the detail endpoint; empty in list responses). */
  description: string;
  imagePath: string;
  mapUrl: string;
  navigationUrl: string;
  appleNavigationUrl: string;
  order: number;
}

export type Language = 'EN' | 'SL' | 'DE' | 'NL';

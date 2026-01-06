# SEO Implementation for Visit Polzela

This document describes the comprehensive SEO (Search Engine Optimization) implementation for the Visit Polzela web application.

## Features Implemented

### 1. Per-Route Meta Tags with react-helmet-async

Every page now has dynamic, language-specific meta tags including:
- **Title tags** optimized for each route
- **Meta descriptions** tailored to content
- **Canonical URLs** to prevent duplicate content issues
- **Language alternates** for multilingual SEO

### 2. Open Graph & Twitter Cards

Social media sharing is optimized with:
- **Open Graph tags** for Facebook, LinkedIn, etc.
- **Twitter Card tags** for enhanced Twitter sharing
- **High-quality preview images** for each POI
- **Localized content** based on user's language selection

### 3. JSON-LD Structured Data (Schema.org)

Search engines can better understand your content with:

#### Homepage:
- **TouristInformationCenter** schema
- **ItemList** schema for all POIs
- Geo-coordinates for Polzela

#### POI Detail Pages:
- **TouristAttraction** schema for each location
- **BreadcrumbList** for navigation hierarchy
- Geo-coordinates and map links
- Images and descriptions

### 4. robots.txt

Located at: `/robots.txt`
- Allows all search engine crawlers
- Specifies sitemap location
- Sets polite crawl-delay

### 5. sitemap.xml

Located at: `/sitemap.xml`

Comprehensive XML sitemap with:
- Homepage with language alternates
- All 16 POI pages with images
- Priority and change frequency hints
- Image sitemap for Google Images SEO

### 6. Multi-language Support

SEO content is available in 4 languages:
- **English (EN)** - Primary language
- **Slovenian (SL)** - Local language
- **German (DE)**
- **Dutch (NL)**

Each language has:
- Localized titles and descriptions
- Proper locale tags (`en_US`, `sl_SI`, etc.)
- Alternate language links

## Files Created/Modified

### New Files:
1. `/src/main/frontend/components/SEO.tsx` - React Helmet async wrapper component
2. `/src/main/frontend/utils/seoHelpers.ts` - Structured data generators
3. `/src/main/resources/META-INF/resources/robots.txt` - Robots file
4. `/src/main/resources/META-INF/resources/sitemap.xml` - XML sitemap

### Modified Files:
1. `/src/main/frontend/index.tsx` - Added HelmetProvider
2. `/src/main/frontend/index.html` - Enhanced base meta tags
3. `/src/main/frontend/views/MainView.tsx` - Added SEO component with structured data
4. `/src/main/frontend/views/POIDetailView.tsx` - Added SEO component with POI-specific structured data

## How It Works

### MainView (Homepage)
```typescript
<SEO
  title="Visit Polzela - Discover Slovenia Tourist Attractions"
  description="Explore Polzela, Slovenia - your offline guide..."
  canonicalUrl="/"
  locale="en_US"
  alternateLocales={['sl_SI', 'de_DE', 'nl_NL']}
  structuredData={combinedSchema}
/>
```

### POIDetailView (Individual POI Pages)
```typescript
<SEO
  title="Polzela Castle - Visit Polzela"
  description="Historic castle in Polzela..."
  canonicalUrl="/poi/castle"
  image="/images/castle.webp"
  type="place"
  locale="en_US"
  structuredData={combinedSchema}
/>
```

## SEO Best Practices Implemented

✅ **Semantic HTML** - Proper heading hierarchy
✅ **Image optimization** - WebP format, lazy loading, alt tags
✅ **Mobile-first** - Responsive design with proper viewport meta
✅ **Performance** - Fast loading with service worker caching
✅ **Accessibility** - ARIA labels where needed
✅ **Progressive Web App** - Installable with manifest
✅ **Structured data** - Rich snippets for search results
✅ **Canonical URLs** - Prevents duplicate content penalties
✅ **Language alternates** - Proper hreflang implementation

## Testing Your SEO

### 1. Google Rich Results Test
URL: https://search.google.com/test/rich-results

Test your POI pages to see how Google interprets the structured data.

### 2. Facebook Sharing Debugger
URL: https://developers.facebook.com/tools/debug/

Test Open Graph tags and preview how links appear on Facebook.

### 3. Twitter Card Validator
URL: https://cards-dev.twitter.com/validator

Test Twitter Card tags for proper social sharing.

### 4. Google Search Console
After deployment, submit your sitemap:
1. Visit https://search.google.com/search-console
2. Add your property
3. Submit sitemap: `https://visit-polzela.com/sitemap.xml`

## Next Steps for Production

1. **Update Domain**: Change `visit-polzela.com` in:
   - `sitemap.xml`
   - `robots.txt`
   - `index.html` canonical tags

2. **Submit to Search Engines**:
   - Google Search Console
   - Bing Webmaster Tools

3. **Monitor Performance**:
   - Google Analytics for traffic
   - Search Console for search performance
   - Core Web Vitals for page speed

4. **Optional Enhancements**:
   - Add Google Analytics tracking
   - Implement server-side rendering (SSR) for even better SEO
   - Add blog/news section for fresh content
   - Build backlinks from tourism websites

## Prerendering (Optional)

For even better SEO, consider prerendering key routes for crawlers using services like:
- Prerender.io
- Rendertron
- Static site generation

This is optional since your current implementation with client-side rendering and proper meta tags should work well for most search engines.

## Notes

- All structured data follows Schema.org standards
- Images use WebP format for optimal performance
- The app works offline after first visit (PWA)
- Language preference persists in localStorage
- Sitemap includes all 16 POIs with proper priorities

---

**Last Updated**: November 6, 2025
**SEO Version**: 1.0


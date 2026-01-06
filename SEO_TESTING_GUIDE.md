# Quick Start Guide for SEO Testing

## Prerequisites
- Node.js installed
- Maven/Java installed for Quarkus backend
- `react-helmet-async` package installed ✅ (already done)

## Testing Locally

### 1. Start the Development Server
```bash
mvn quarkus:dev
```

The application should start at `http://localhost:8080`

### 2. Verify SEO Meta Tags

#### Homepage (/)
Open browser DevTools (F12) and check:
- `<title>` tag changes based on language
- `<meta name="description">` is present
- `<link rel="canonical">` points to "/"
- `<meta property="og:*">` tags for Open Graph
- `<meta name="twitter:*">` tags for Twitter
- `<script type="application/ld+json">` with structured data

#### POI Detail Page (/poi/castle)
Check:
- `<title>` includes POI name
- Description uses actual POI content
- Canonical URL is `/poi/castle`
- Structured data includes TouristAttraction schema
- Breadcrumb structured data is present

### 3. Test Language Switching
1. Click on different language flags
2. Observe that meta tags update dynamically
3. Check that `og:locale` changes
4. Verify structured data language changes

### 4. Verify Static Files

#### robots.txt
Visit: `http://localhost:8080/robots.txt`
Should see:
```
User-agent: *
Allow: /
...
```

#### sitemap.xml
Visit: `http://localhost:8080/sitemap.xml`
Should see XML with all POIs listed

## Testing with Online Tools

### Google Rich Results Test
1. Deploy to production or use ngrok for local testing:
   ```bash
   ngrok http 8080
   ```
2. Visit: https://search.google.com/test/rich-results
3. Enter your URL (e.g., POI page)
4. Click "Test URL"
5. View rich results preview

### Facebook Sharing Debugger
1. Visit: https://developers.facebook.com/tools/debug/
2. Enter your production URL
3. Click "Debug"
4. View Open Graph preview

### Twitter Card Validator
1. Visit: https://cards-dev.twitter.com/validator
2. Enter your production URL
3. View Twitter Card preview

## Manual Verification Checklist

### Homepage SEO Checklist
- [ ] Title tag is descriptive and under 60 characters
- [ ] Meta description is under 160 characters
- [ ] Canonical URL is set correctly
- [ ] Open Graph tags are present
- [ ] Twitter Card tags are present
- [ ] Structured data (Organization + ItemList) is valid JSON-LD
- [ ] Language alternates are specified
- [ ] Images have alt text

### POI Detail Page SEO Checklist
- [ ] Title includes POI name + site name
- [ ] Description is POI-specific
- [ ] Canonical URL matches current route
- [ ] OG image is POI-specific
- [ ] Structured data includes TouristAttraction
- [ ] Breadcrumb structured data is present
- [ ] Coordinates are in structured data

### General SEO Checklist
- [ ] robots.txt is accessible
- [ ] sitemap.xml is accessible and valid
- [ ] No duplicate title tags
- [ ] No duplicate meta descriptions
- [ ] All images have alt attributes
- [ ] Page loads quickly (< 3 seconds)
- [ ] Mobile responsive
- [ ] HTTPS enabled (in production)

## Common Issues & Solutions

### Issue: Meta tags not updating on navigation
**Solution**: Ensure `<HelmetProvider>` wraps your app in `index.tsx` ✅

### Issue: Structured data validation errors
**Solution**: Test JSON-LD at https://validator.schema.org/

### Issue: Sitemap not found
**Solution**: Verify file is in `/src/main/resources/META-INF/resources/` ✅

### Issue: Language not persisting
**Solution**: Check localStorage is saving `selectedLanguage` ✅

## View Source vs DevTools

**Important**: When checking SEO, use:
- **"View Page Source"** (Ctrl+U) to see server-rendered HTML
- **DevTools** to see React-injected meta tags (client-side)

Search engines can now execute JavaScript, so both methods are valid, but server-side rendering would be ideal for maximum compatibility.

## Production Deployment Checklist

Before deploying to production:

1. **Update Domain References**
   - [ ] sitemap.xml - change URLs to production domain
   - [ ] robots.txt - update sitemap URL
   - [ ] index.html - update canonical URL

2. **Enable HTTPS**
   - [ ] Configure SSL certificate
   - [ ] Force HTTPS redirects

3. **Submit to Search Engines**
   - [ ] Google Search Console - submit sitemap
   - [ ] Bing Webmaster Tools - submit sitemap

4. **Monitor**
   - [ ] Set up Google Analytics
   - [ ] Monitor Core Web Vitals
   - [ ] Check Search Console for errors

## Performance Tips

- Images are already in WebP format ✅
- Service Worker caches assets ✅
- Consider adding:
  - CDN for static assets
  - Image optimization service
  - Lazy loading (already implemented) ✅

## Next Steps

1. Test locally with the checklist above
2. Deploy to staging environment
3. Test with online tools
4. Fix any validation errors
5. Deploy to production
6. Submit sitemap to search engines
7. Monitor performance

---

**Note**: This implementation provides excellent SEO foundation. The structured data, meta tags, and sitemap will help search engines understand and rank your content effectively.


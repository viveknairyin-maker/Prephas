## Advanced SEO Tasks

- [x] Create shared `<Footer />` component containing internal links and external authority links
- [x] Update `src/App.jsx` to map pricing, ats-analyzer, and resume-builder routes
- [x] Update `src/components/Navbar.jsx` to reference new routes and re-add Pricing link
- [x] Update `index.html` to add structured metadata (FAQ, SoftwareApplication, Organization, WebSite) and target canonical URL: https://prephas.online
- [x] Update `vercel.json` with canonical redirects and route rewrites
- [x] Create `public/sitemap.xml` mapping prephas.online pages
- [x] Create `public/robots.txt` mapping to the prephas.online sitemap
- [x] Update `src/pages/LandingPage.jsx` to integrate Helmet, FAQ visible section, SEO content block, and shared Footer
- [x] Update `src/pages/TemplatesPage.jsx` to integrate Helmet and shared Footer
- [x] Update `src/pages/PricingPage.jsx` to integrate Helmet and shared Footer
- [x] Update `src/pages/LoginPage.jsx` & `src/pages/SignupPage.jsx` with Helmet tags
- [x] Verify build compiles cleanly (`npm run build`)
- [x] Resolve mobile app crash on "Fix & Build" navigation using optional chaining and null checks
- [x] Configure dynamic `authDomain` and Vercel rewrite proxy to remove default Firebase branding
- [x] Optimize social sharing: 
  - **Link Preview Image**: Standardized `og:image` to `logo.png` for cleaner social card previews.
  - **Detailed Sharing Text**: Implemented structured 2-line messaging for ATS scores, job matches, and invitations to improve click-through rates.

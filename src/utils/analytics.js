/**
 * Google Analytics 4 tracking utility for PREPHAS
 */

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

// Helper to check if GA is active and configured
const isGAEnabled = () => {
  return typeof window !== 'undefined' && GA_MEASUREMENT_ID && GA_MEASUREMENT_ID.startsWith('G-');
};

/**
 * Initializes Google Analytics 4 by dynamically injecting gtag.js script tags
 */
export const initGA = () => {
  if (!isGAEnabled()) {
    console.warn("Google Analytics: Measurement ID (VITE_GA_MEASUREMENT_ID) is missing or invalid. Analytics is disabled.");
    return;
  }

  try {
    // Check if script is already added
    const scriptId = 'google-analytics-gtag';
    if (document.getElementById(scriptId)) return;

    // Create script element to load gtag.js
    const script = document.createElement('script');
    script.id = scriptId;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    // Initialize dataLayer and gtag function
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };

    window.gtag('js', new Date());
    // Disable automatic pageview measurement by gtag config since we handle it manually via React Router
    window.gtag('config', GA_MEASUREMENT_ID, {
      send_page_view: false
    });
  } catch (error) {
    console.error("Google Analytics: Failed to initialize gtag.js script:", error);
  }
};

/**
 * Tracks page view manually (essential for React Router SPAs)
 * @param {string} path - The relative URL path (e.g. /dashboard)
 */
export const trackPageView = (path) => {
  if (!isGAEnabled()) return;

  try {
    if (typeof window.gtag === 'function') {
      window.gtag('config', GA_MEASUREMENT_ID, {
        page_path: path,
        page_location: window.location.href,
        page_title: document.title
      });
      if (import.meta.env.DEV) {
        console.log(`[GA4 page_view] Path: ${path}`);
      }
    }
  } catch (error) {
    console.error("Google Analytics: Failed to track page view:", error);
  }
};

/**
 * Logs a custom event to GA4
 * @param {string} eventName - Name of the custom event (e.g. 'Resume Created')
 * @param {Object} params - Event parameters/metadata
 */
export const trackEvent = (eventName, params = {}) => {
  if (!isGAEnabled()) return;

  try {
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, params);
      if (import.meta.env.DEV) {
        console.log(`[GA4 event] Name: "${eventName}"`, params);
      }
    }
  } catch (error) {
    console.error(`Google Analytics: Failed to track event "${eventName}":`, error);
  }
};

(() => {
  // Load CookieConsent v3 core (defer so markup/css are parsed first)
  const core = document.createElement('script');
  core.src = 'https://cdn.jsdelivr.net/npm/vanilla-cookieconsent@3.1.0/dist/cookieconsent.umd.js';
  core.defer = true;

  core.onload = () => {
    if (!window.CookieConsent) return; // safety guard

    // Avoid double init of trackers within one page lifecycle
    window.__trackingLoaded = window.__trackingLoaded || { pixel: false, ga: false };

    // --- Meta Pixel ---------------------------------------------------------
    const loadMetaPixel = (pixelId) => {
      if (window.__trackingLoaded.pixel) return;
      !((f, b, e, v, n, t, s) => {
        if (f.fbq) return;
        n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
        if (!f._fbq) f._fbq = n; n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
        t = b.createElement(e); t.async = true; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
      })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', pixelId);
      fbq('track', 'PageView');
      window.__trackingLoaded.pixel = true;
    };

    // --- Google Tag (gtag.js) for Ads / GA4 --------------------------------
    const loadGoogleTag = (tagId, grants) => {
      if (window.__trackingLoaded.ga) return;
      window.dataLayer = window.dataLayer || [];
      function gtag(){ dataLayer.push(arguments); }
      window.gtag = gtag;

      // Default: deny everything before consent
      gtag('consent', 'default', {
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        ad_storage: 'denied',
        analytics_storage: 'denied'
      });

      const s = document.createElement('script');
      s.async = true;
      s.src = `https://www.googletagmanager.com/gtag/js?id=${tagId}`;
      document.head.appendChild(s);

      gtag('js', new Date());
      gtag('config', tagId);
      gtag('consent', 'update', grants);

      window.__trackingLoaded.ga = true;
    };

    // Update Consent Mode later without reloading gtag.js
    const updateGoogleConsent = (grants) => {
      if (typeof window.gtag === 'function') gtag('consent', 'update', grants);
    };

    // Apply current preferences (used for first accept, page loads, and changes)
    function handleConsent(cookie) {
      const categories = cookie?.categories || cookie?.cookie?.categories || [];
      const ok = new Set(categories);

      // Marketing → Meta Pixel + Google Ads
      if (ok.has('marketing')) {
        loadMetaPixel('1016873180466291');
        loadGoogleTag('AW-17512040775', {
          ad_user_data: 'granted',
          ad_personalization: 'granted',
          ad_storage: 'granted'
        });
      } else {
        updateGoogleConsent({
          ad_user_data: 'denied',
          ad_personalization: 'denied',
          ad_storage: 'denied'
        });
      }

      // Analytics → GA4 (ready when you have G‑ID)
      if (ok.has('analytics')) {
        if (window.__trackingLoaded.ga && typeof window.gtag === 'function') {
          // gtag.js already present (e.g., via AW): just configure GA4
          gtag('config', 'G-XXXXXXX'); // TODO: replace with your GA4 ID
          gtag('consent', 'update', { analytics_storage: 'granted' });
        } else {
          // If GA4 will be used standalone (without AW), load it like this:
          // loadGoogleTag('G-XXXXXXX', { analytics_storage: 'granted' }); // TODO: replace with GA4 ID if needed
        }
        updateGoogleConsent({ analytics_storage: 'granted' });
      } else {
        updateGoogleConsent({ analytics_storage: 'denied' });
      }
    }

    // Run CookieConsent with UI, categories and handlers
    CookieConsent.run({
      guiOptions: {
        consentModal: { layout: 'cloud', position: 'bottom center' },
        preferencesModal: { layout: 'box' }
      },
      categories: {
        necessary: { enabled: true, readOnly: true },
        analytics: {},
        marketing: {}
      },
      language: {
        default: 'cs',
        translations: {
          cs: {
            consentModal: {
              title: 'Na vašem soukromí nám záleží',
              description: 'Technické cookies používáme vždy. Analytické a marketingové spouštíme až po vašem souhlasu.',
              acceptAllBtn: 'Souhlasím se vším',
              showPreferencesBtn: 'Nastavení cookies'
            },
            preferencesModal: {
              title: 'Nastavení cookies',
              acceptAllBtn: 'Souhlasím se vším',
              savePreferencesBtn: 'Uložit nastavení',
              sections: [
                { title: 'Technické cookies', description: 'Nutné pro základní fungování webu.', linkedCategory: 'necessary' },
                { title: 'Analytické cookies', description: 'Pomáhají nám zlepšovat web (spustíme je až po vašem souhlasu).', linkedCategory: 'analytics' },
                { title: 'Marketingové cookies', description: 'Pro personalizaci a měření reklam (Meta Pixel, Google Ads).', linkedCategory: 'marketing' }
              ]
            }
          }
        }
      },
      onFirstConsent: handleConsent,
      onConsent: handleConsent,
      onChange(cookie){ handleConsent(cookie); }
    });
  };

  core.onerror = () => console.error('[CC] Failed to load CookieConsent core');
  document.head.appendChild(core);
})();
(() => {
    // Dynamically load the CookieConsent (v3) core script so we fully control load order.
    const core = document.createElement('script');
    core.src = "https://cdn.jsdelivr.net/npm/vanilla-cookieconsent@3.1.0/dist/cookieconsent.umd.js";
    core.defer = true;

    core.onload = () => {
        console.log('[CC] core loaded:', !!window.CookieConsent);
        if (!window.CookieConsent) {
            // Safety guard: if the library failed to load, stop here to avoid runtime errors.
            console.warn('[CC] core nenahraný');
            return;
        }

        // Simple flags so we don't initialize the same tracker multiple times in one session.
        // pixel -> Meta (Facebook) Pixel; ga -> Google Tag (used for Ads and later GA4)
        window.__trackingLoaded = window.__trackingLoaded || { pixel: false, ga: false };

        // --- Meta Pixel loader -------------------------------------------------------------
        // Injects the Meta Pixel script and initializes it. Called ONLY after marketing consent.
        const loadMetaPixel = (pixelId) => {
            if (window.__trackingLoaded.pixel) return; // already initialized
            // Official FB snippet (wrapped) – this injects fbevents.js asynchronously.
            !((f, b, e, v, n, t, s) => {
                if (f.fbq) return;
                n = f.fbq = function () {
                    n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
                };
                if (!f._fbq) f._fbq = n;
                n.push = n;
                n.loaded = true;
                n.version = '2.0';
                n.queue = [];
                t = b.createElement(e);
                t.async = true;
                t.src = v;
                s = b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t, s);
            })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

            // Initialize and send a basic PageView event after consent.
            fbq('init', pixelId);
            fbq('track', 'PageView');
            window.__trackingLoaded.pixel = true;
            console.log('[CC] Meta Pixel spustený');
        };

        // --- Google Tag loader (Ads / GA4) ------------------------------------------------
        // Loads gtag.js and applies initial consent defaults. Call with grants object
        // describing which storages are granted (e.g., ad_storage / analytics_storage).
        const loadGoogleTag = (tagId, grants) => {
            if (window.__trackingLoaded.ga) return; // already loaded (we'll update consent separately)

            // Bootstrap dataLayer/gtag API
            window.dataLayer = window.dataLayer || [];
            function gtag() { dataLayer.push(arguments); }
            window.gtag = gtag;

            // Consent Mode default (deny everything) before we load gtag.js
            gtag('consent', 'default', {
                ad_user_data: 'denied',
                ad_personalization: 'denied',
                ad_storage: 'denied',
                analytics_storage: 'denied'
            });

            // Inject gtag.js
            const s = document.createElement('script');
            s.async = true;
            s.src = `https://www.googletagmanager.com/gtag/js?id=${tagId}`;
            document.head.appendChild(s);

            // Basic init + property config
            gtag('js', new Date());
            gtag('config', tagId);

            // Apply granted consent domains (e.g., for Ads or Analytics) right away
            gtag('consent', 'update', grants);

            window.__trackingLoaded.ga = true;
            console.log('[CC] Google Tag loaded', tagId, grants);
        };

        // --- Consent updater helper -------------------------------------------------------
        // This is used when preferences change later. It updates Consent Mode without
        // reloading the Google Tag (works only after gtag exists).
        const updateGoogleConsent = (grants) => {
            if (typeof window.gtag === 'function') {
                gtag('consent', 'update', grants);
                console.log('[CC] Google consent updated', grants);
            }
        };

        // --- CookieConsent UI and behavior ------------------------------------------------
        CookieConsent.run({
            // UI layouts: main banner + preferences modal ("Nastavení cookies")
            guiOptions: {
                consentModal: { layout: "cloud", position: "bottom center" },
                preferencesModal: { layout: "box" }
            },

            // Categories shown to the user. "necessary" is always enabled/readOnly.
            // "analytics" is prepared for future GA4; "marketing" controls Meta Pixel + Google Ads.
            categories: {
                necessary: { enabled: true, readOnly: true },
                analytics: {},
                marketing: {}
            },

            // Language strings (Czech). Adjust texts to your tone of voice if needed.
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

            // Consent callbacks. Run once on first decision and every time user changes preferences.
            onConsent: (cookie) => {
                const ok = new Set(cookie?.categories || []);

                // --- Marketing consent ----------------------------------------------------
                // If granted, start Meta Pixel and Google Ads (AW-...). If not granted,
                // send explicit deny to Consent Mode for ads domains.
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

                // --- Analytics consent ----------------------------------------------------
                // Prepared for GA4 (G-XXXXXXX). Handles both first load and case when gtag.js
                // is already loaded by Google Ads (AW).
                if (ok.has('analytics')) {
                    if (window.__trackingLoaded.ga && typeof window.gtag === 'function') {
                        // gtag.js is already loaded (via AW), just configure GA4
                        gtag('config', 'G-XXXXXXX');
                        gtag('consent', 'update', { analytics_storage: 'granted' });
                    } else {
                        // First load (if GA4 is the only tag)
                        // TODO: when you get your GA4 ID, uncomment next line with your ID
                        // loadGoogleTag('G-XXXXXXX', { analytics_storage: 'granted' });
                    }
                    updateGoogleConsent({ analytics_storage: 'granted' });
                } else {
                    updateGoogleConsent({ analytics_storage: 'denied' });
                }
            },

            // Re-apply the same logic whenever user changes their selection in the modal.
            onChange(cookie) { this.onConsent(cookie); }
        });
    };

    core.onerror = () => console.error('[CC] nepodarilo sa načítať core knižnicu');

    // Start loading the core library now.
    document.head.appendChild(core);
})();
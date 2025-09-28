(() => {
    const core = document.createElement('script');
    core.src = "https://cdn.jsdelivr.net/npm/vanilla-cookieconsent@3.1.0/dist/cookieconsent.umd.js";
    core.defer = true;

    core.onload = () => {
        console.log('[CC] core loaded:', !!window.CookieConsent);
        if (!window.CookieConsent) {
            console.warn('[CC] core nenahraný');
            return;
        }

        window.__trackingLoaded = window.__trackingLoaded || { pixel: false, ga: false };

        const loadMetaPixel = (pixelId) => {
            if (window.__trackingLoaded.pixel) return;
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

            fbq('init', pixelId); // Pixel ID
            fbq('track', 'PageView');
            window.__trackingLoaded.pixel = true;
            console.log('[CC] Meta Pixel spustený');
        };
        const loadGoogleTag = (tagId, grants) => {
            if (window.__trackingLoaded.ga) return;

            window.dataLayer = window.dataLayer || [];
            function gtag() { dataLayer.push(arguments); }
            window.gtag = gtag;

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
            console.log('[CC] Google Tag loaded', tagId, grants);
        };

        // CookieConsent config and init
        CookieConsent.run({
            guiOptions: { consentModal: { layout: "cloud", position: "bottom center" } },
            categories: {
                necessary: { enabled: true, readOnly: true },
                marketing: {}
            },
            language: {
                default: 'cs',
                translations: {
                    cs: {
                        consentModal: {
                            title: 'Používáme cookies 🍪',
                            description: 'Nezbytné cookies používáme vždy. Marketingové spouštíme až po vašem souhlasu.',
                            acceptAllBtn: 'Povolit vše',
                            acceptNecessaryBtn: 'Povolit jen nezbytné'
                        }
                    }
                }
            },
            onConsent: (cookie) => {
                const ok = new Set(cookie?.categories || []);

                if (ok.has('marketing')) {
                    loadMetaPixel('1016873180466291');
                    loadGoogleTag('AW-17512040775', {
                        ad_user_data: 'granted',
                        ad_personalization: 'granted',
                        ad_storage: 'granted'
                    });
                }
            },
            onChange(cookie) { this.onConsent(cookie); }
        });
    };

    core.onerror = () => console.error('[CC] nepodarilo sa načítať core knižnicu');

    document.head.appendChild(core);
})();
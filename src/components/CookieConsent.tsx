import { useState, useEffect } from 'react';

/**
 * Cookie Consent Component
 * GDPR/KVKK compliant cookie consent management
 * 
 * This is a basic implementation. For production, integrate with a CMP service
 * like Cookiebot, OneTrust, or Osano.
 * 
 * Requirements:
 * - Show consent banner before loading non-essential cookies
 * - Allow users to accept/reject cookies by category
 * - Store consent preferences
 * - Block third-party scripts until consent is given
 */
interface CookiePreferences {
  necessary: boolean; // Always true - required for site functionality
  analytics: boolean; // Google Analytics, etc.
  marketing: boolean; // Advertising, tracking
  functional: boolean; // Enhanced functionality
}

const COOKIE_CONSENT_KEY = 'cookie-consent-preferences';
const COOKIE_CONSENT_VERSION = '1.0';

export const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
    functional: false,
  });

  useEffect(() => {
    // Check if user has already given consent
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!stored) {
      setShowBanner(true);
    } else {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.version === COOKIE_CONSENT_VERSION) {
          setPreferences(parsed.preferences);
        } else {
          // Version mismatch - show banner again
          setShowBanner(true);
        }
      } catch (error) {
        setShowBanner(true);
      }
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
    };
    savePreferences(allAccepted);
    setShowBanner(false);
    // Load third-party scripts here
    loadThirdPartyScripts(allAccepted);
  };

  const handleRejectAll = () => {
    const onlyNecessary: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false,
    };
    savePreferences(onlyNecessary);
    setShowBanner(false);
  };

  const handleSavePreferences = () => {
    savePreferences(preferences);
    setShowBanner(false);
    loadThirdPartyScripts(preferences);
  };

  const savePreferences = (prefs: CookiePreferences) => {
    const data = {
      version: COOKIE_CONSENT_VERSION,
      preferences: prefs,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(data));
    setPreferences(prefs);
  };

  const loadThirdPartyScripts = (prefs: CookiePreferences) => {
    // Only load scripts if user has consented
    if (prefs.analytics) {
      // Load Google Analytics, etc.
      // Example: window.gtag = ...
    }
    if (prefs.marketing) {
      // Load marketing scripts
    }
    if (prefs.functional) {
      // Load functional scripts
    }
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Çerez Tercihleri
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Bu web sitesi, deneyiminizi iyileştirmek ve site kullanımını analiz etmek için çerezler kullanmaktadır.
              {' '}
              <a
                href="/privacy-policy"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Gizlilik Politikası
              </a>
              {' '}ve{' '}
              <a
                href="/cookie-policy"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Çerez Politikası
              </a>
              {' '}hakkında daha fazla bilgi edinin.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleRejectAll}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              Sadece Gerekli
            </button>
            <button
              onClick={handleAcceptAll}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Tümünü Kabul Et
            </button>
            <button
              onClick={() => {
                // Show detailed preferences modal
                // This would open a modal with category toggles
                handleSavePreferences();
              }}
              className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 rounded-lg transition-colors"
            >
              Özelleştir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Check if user has consented to a specific cookie category
 */
export const hasCookieConsent = (category: keyof CookiePreferences): boolean => {
  try {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!stored) return false;
    
    const parsed = JSON.parse(stored);
    if (parsed.version !== COOKIE_CONSENT_VERSION) return false;
    
    return parsed.preferences[category] === true;
  } catch {
    return false;
  }
};


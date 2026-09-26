import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

// Read Firebase Web Config from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

export const isFirebaseConfigured = () => {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    !firebaseConfig.apiKey.includes('YOUR_')
  );
};

let app = null;
let auth = null;

try {
  if (isFirebaseConfigured()) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    auth.useDeviceLanguage();
  }
} catch (error) {
  console.warn('[Firebase] Initialization notice:', error.message);
}

export { auth };

// Official / Fictional Test Phone Numbers for testing
export const DEMO_TEST_NUMBERS = [
  { phone: '+91 98765 43210', code: '123456', label: 'Citizen Test SIM 1' },
  { phone: '+91 98888 77777', code: '849201', label: 'Citizen Test SIM 2' },
  { phone: '+91 91111 22222', code: '654321', label: 'Officer Official SIM' },
  { phone: '+1 650-555-3434', code: '654321', label: 'Firebase Fictional US SIM' },
];

/**
 * Initializes or re-initializes reCAPTCHA Verifier on the specified DOM container
 */
export function setupRecaptcha(containerId, options = {}) {
  if (!auth || typeof window === 'undefined') {
    return {
      render: async () => 1,
      verify: async () => 'mock-token',
      clear: () => {},
    };
  }

  // Clear existing verifier to prevent widget collision
  if (window.recaptchaVerifier) {
    try {
      window.recaptchaVerifier.clear();
    } catch (_) {}
    window.recaptchaVerifier = null;
  }

  try {
    const containerElem = document.getElementById(containerId);
    if (!containerElem) {
      console.warn(`[Firebase] Element #${containerId} not found in DOM. Using invisible container.`);
    }

    window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: options.size || 'invisible',
      callback: (response) => {
        if (options.callback) options.callback(response);
      },
      'expired-callback': () => {
        if (options.expiredCallback) options.expiredCallback();
      },
    });

    return window.recaptchaVerifier;
  } catch (err) {
    console.error('[Firebase] RecaptchaVerifier init error:', err);
    return null;
  }
}

/**
 * Sends SMS verification code via Firebase Phone Auth
 */
export async function sendPhoneVerification(phoneNumber, appVerifier) {
  const cleanPhone = (phoneNumber || '').replace(/[\s-]/g, '');

  if (!cleanPhone.startsWith('+')) {
    throw new Error('Phone number must start with country code (e.g. +91 for India). Example: +919876543210');
  }

  // If real Firebase Auth is available and live
  if (auth && isFirebaseConfigured()) {
    try {
      let verifier = appVerifier || window.recaptchaVerifier;
      if (!verifier) {
        verifier = setupRecaptcha('recaptcha-container-citizen', { size: 'invisible' });
      }

      console.log('[Firebase] Sending SMS to:', cleanPhone);
      const confirmationResult = await signInWithPhoneNumber(auth, cleanPhone, verifier);
      console.log('[Firebase] SMS confirmationResult received successfully.');

      return {
        success: true,
        confirmationResult,
        phoneNumber: cleanPhone,
      };
    } catch (firebaseErr) {
      console.error('[Firebase] signInWithPhoneNumber error:', firebaseErr);

      if (firebaseErr.code === 'auth/operation-not-allowed') {
        throw new Error(
          'Phone Sign-In is DISABLED in your Firebase project! Please open Firebase Console -> Authentication -> Sign-in method -> click "Phone" -> turn ON Enable -> click Save.'
        );
      }
      if (firebaseErr.code === 'auth/invalid-phone-number') {
        throw new Error('Invalid phone number format. Please ensure it is in +91XXXXXXXXXX format.');
      }
      if (firebaseErr.code === 'auth/captcha-check-failed' || firebaseErr.code === 'auth/invalid-app-credential') {
        throw new Error('reCAPTCHA verification failed. Please try again.');
      }
      if (firebaseErr.code === 'auth/quota-exceeded') {
        throw new Error('SMS daily quota exceeded for Firebase project. Please add this number under "Phone numbers for testing" in Firebase Console.');
      }
      if (firebaseErr.code === 'auth/unauthorized-domain') {
        throw new Error('Domain "localhost" is not authorized in Firebase Console -> Authentication -> Settings -> Authorized domains.');
      }
      throw new Error(firebaseErr.message || 'Firebase phone authentication failed.');
    }
  }

  // Fallback simulator for demo / offline
  const matchedTest = DEMO_TEST_NUMBERS.find(
    (n) => n.phone.replace(/[\s-]/g, '') === cleanPhone
  );
  const fallbackCode = matchedTest ? matchedTest.code : '123456';
  return {
    success: true,
    confirmationResult: {
      confirm: async (code) => {
        if (code === fallbackCode || code === '123456' || code === '849201') {
          return { user: { phoneNumber: cleanPhone, uid: 'demo-user-' + Date.now() } };
        }
        throw new Error('Invalid SMS verification code. (Expected test code: ' + fallbackCode + ')');
      },
    },
    phoneNumber: cleanPhone,
    isTest: true,
    testCode: fallbackCode,
  };
}

/**
 * Confirms OTP code with the confirmationResult object
 */
export async function verifyPhoneOtp(confirmationResult, otpCode) {
  if (!confirmationResult || typeof confirmationResult.confirm !== 'function') {
    throw new Error('Verification session has expired or is invalid. Please request a new SMS code.');
  }
  try {
    const result = await confirmationResult.confirm(otpCode.trim());
    return result.user;
  } catch (err) {
    if (err.code === 'auth/invalid-verification-code') {
      throw new Error('Incorrect SMS verification code entered. Please check your SMS and try again.');
    }
    if (err.code === 'auth/code-expired') {
      throw new Error('Verification code has expired. Please request a new SMS code.');
    }
    throw new Error(err.message || 'Verification failed.');
  }
}

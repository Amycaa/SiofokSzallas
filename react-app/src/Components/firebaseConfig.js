import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";  // ← ez hiányzik
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";


const firebaseConfig = {
  apiKey: "AIzaSyDrVrA62idWwGQZl_81q1HCBb1nDUMg7mA",
  authDomain: "siofokszallas-675c8.firebaseapp.com",
  projectId: "siofokszallas-675c8",
  storageBucket: "siofokszallas-675c8.firebasestorage.app",
  messagingSenderId: "479731387392",
  appId: "1:479731387392:web:60c044c28160eeae609ce5"
};

const app = initializeApp(firebaseConfig);

// App Check csak éles környezetben
if (window.location.hostname !== 'localhost') {
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider('A_TE_RECAPTCHA_SITE_KEY'),
    isTokenAutoRefreshEnabled: true,
  });
} else {
  // Localhost: debug token engedélyezése
  self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
}

export const db = getFirestore(app);
export const auth = getAuth(app);

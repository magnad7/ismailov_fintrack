import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

import { serviceAccount } from "./serviceAccount";

export const initFirebaseAdmin = () => {
  if (getApps().length === 0) {
    try {
      initializeApp({
        credential: cert(serviceAccount as any),
      });

      console.log("Firebase Admin muvaffaqiyatli ishga tushdi!");
    } catch (error) {
      console.error("Firebase Admin Initialization Error:", error);
    }
  }
};

export const getAdminAuth = () => {
  initFirebaseAdmin();
  return getAuth();
};

export const getAdminFirestore = () => {
  initFirebaseAdmin();
  return getFirestore();
};

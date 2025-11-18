import admin from 'firebase-admin';
//import { readFileSync } from "fs";
//import path from "path";

//const serviceAccountPath = path.resolve("./serviceAccount.json");
//const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));


const serviceAccount = {
  "type": "service_account",
  "project_id": process.env.FIREBASE_PROJECT_ID,
  "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID,
  "private_key": process.env.FIREBASE_PRIVATE_KEY,
  "client_email": process.env.FIREBASE_CLIENT_EMAIL,
  "client_id": process.env.FIREBASE_CLIENT_ID,
  "auth_uri": process.env.FIREBASE_AUTH_URI,
  "token_uri": process.env.FIREBASE_TOKEN_URI,
  "auth_provider_x509_cert_url": process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  "client_x509_cert_url": process.env.FIREBASE_CLIENT_X509_CERT_URL,
  "universe_domain": "googleapis.com"
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.DATABASE_URL
});

const db = admin.firestore();

export { db };
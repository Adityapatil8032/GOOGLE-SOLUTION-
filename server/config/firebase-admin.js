import admin from 'firebase-admin';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let serviceAccount = null;
let initializationSource = 'application-default';

try {
  // Option 1: Path from env variable
  if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    serviceAccount = JSON.parse(readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH, 'utf8'));
    initializationSource = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  } 
  // Option 2: Default location in server folder
  else {
    const defaultPath = path.resolve(__dirname, '../serviceAccount.json');
    serviceAccount = JSON.parse(readFileSync(defaultPath, 'utf8'));
    initializationSource = defaultPath;
  }
} catch (error) {
  console.warn('Firebase Admin service account file not found. Falling back to Application Default Credentials.');
}

if (!admin.apps.length) {
  try {
    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    } else {
      admin.initializeApp({
        credential: admin.credential.applicationDefault()
      });
    }
    console.log(`Firebase Admin initialized using ${initializationSource}.`);
  } catch (error) {
    console.warn('Firebase Admin initialization failed:', error.message);
  }
}

export const db = admin.apps.length ? admin.firestore() : null;
export const messagingAdmin = admin.apps.length ? admin.messaging() : null;
export default admin;

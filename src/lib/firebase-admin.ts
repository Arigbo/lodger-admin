import * as admin from 'firebase-admin';

const firebaseAdminConfig = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    // Handle newlines in private key
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

export function getFirebaseAdmin() {
    if (!admin.apps.length) {
        // If we're missing credentials during build, don't initialize
        if (!firebaseAdminConfig.projectId || !firebaseAdminConfig.clientEmail || !firebaseAdminConfig.privateKey) {
            console.warn('Firebase Admin credentials not found. Initialization skipped.');
            return null;
        }

        admin.initializeApp({
            credential: admin.credential.cert({
                project_id: firebaseAdminConfig.projectId,
                client_email: firebaseAdminConfig.clientEmail,
                private_key: firebaseAdminConfig.privateKey,
            } as any),
        });
    }
    return admin;
}

export const adminAuth = getFirebaseAdmin()?.auth();
export const adminDb = getFirebaseAdmin()?.firestore();

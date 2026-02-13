import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export async function POST(request: Request) {
    try {
        const { userId } = await request.json();

        if (!userId) {
            return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
        }

        console.log(`--- SECURE USER DELETION TRIGGERED: ${userId} ---`);

        // 1. Delete from Firebase Auth
        try {
            await adminAuth.deleteUser(userId);
            console.log(`Successfully deleted user ${userId} from Firebase Auth`);
        } catch (authError: any) {
            // If user doesn't exist in Auth, we might still want to delete the Doc
            if (authError.code !== 'auth/user-not-found') {
                console.error('Error deleting from Auth:', authError);
                throw authError;
            }
        }

        // 2. Delete from Firestore
        await adminDb.collection('users').doc(userId).delete();
        console.log(`Successfully deleted user ${userId} document from Firestore`);

        // 3. INTEGRATION POINT: Send notification email
        // Logic for sending email to deleted user (if email available) can be added here.

        return NextResponse.json({ success: true, message: 'User deleted from Auth and Firestore' });
    } catch (error: any) {
        console.error('Secure Deletion API Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

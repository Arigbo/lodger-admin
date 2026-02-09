import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { report } = await request.json();

        console.log('--- ADMIN NOTIFICATION TRIGGERED ---');
        console.log(`New Report ID: ${report.id}`);
        console.log(`Reported User: ${report.reportedUserName}`);
        console.log(`Reason: ${report.reason}`);
        console.log(`Timestamp: ${new Date().toLocaleString()}`);
        console.log('-------------------------------------');

        // INTEGRATION POINT:
        // To enable actual emails, you can use a service like Resend or Nodemailer.
        // Example with Resend:
        /*
        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: 'Lodger Moderation <moderation@lodger.com>',
                to: ['admin@lodger.com'], // Replace with your admin email
                subject: `[ALERT] New User Report: ${report.reason}`,
                html: `
                    <h1>New Security Report</h1>
                    <p><strong>Reported User:</strong> ${report.reportedUserName}</p>
                    <p><strong>Reason:</strong> ${report.reason}</p>
                    <p><strong>Description:</strong> ${report.description}</p>
                    <hr />
                    <a href="${process.env.NEXT_PUBLIC_APP_URL}/moderation">View in Moderation Panel</a>
                `
            })
        });
        */

        return NextResponse.json({ success: true, message: 'Admin notified' });
    } catch (error: any) {
        console.error('Notification API Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

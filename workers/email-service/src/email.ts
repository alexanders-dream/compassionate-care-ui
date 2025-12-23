import { Env } from './index';
import { createClient } from '@supabase/supabase-js';

const RESEND_API_URL = 'https://api.resend.com/emails';

// Simple Email Layout
const emailLayout = (title: string, content: string) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f9; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .header { background-color: #0f172a; color: #ffffff; padding: 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
    .content { padding: 30px; }
    .field { margin-bottom: 15px; }
    .field-label { font-weight: bold; color: #64748b; font-size: 0.9em; text-transform: uppercase; letter-spacing: 0.5px; }
    .field-value { margin-top: 4px; font-size: 16px; }
    .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
    a { color: #2563eb; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${title}</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Compassionate Care. All rights reserved.</p>
      <p>This is an automated message.</p>
    </div>
  </div>
</body>
</html>
`;

async function sendEmail(
    apiKey: string,
    to: string[],
    subject: string,
    html: string,
    from: string = 'Compassionate Care <info@aradvancedwoundcaresolutions.com>'
) {
    const response = await fetch(RESEND_API_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            from,
            to,
            subject,
            html,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Resend API Error: ${response.status} ${errorText}`);
    }

    return response.json();
}

export async function handleAdminNotification(request: Request, env: Env) {
    const data = await request.json() as any;
    const { type, details } = data; // type: 'visit_request' | 'referral' | 'contact'

    let subject = 'New Submission';
    let content = '';

    if (type === 'visit_request') {
        subject = 'New Visit Request Received';
        content = `
            <p>You have received a new request for a home visit. Here are the details:</p>
            <div class="field">
                <div class="field-label">Patient Name</div>
                <div class="field-value">${details.patient_name}</div>
            </div>
            <div class="field">
                <div class="field-label">Contact Info</div>
                <div class="field-value">${details.phone} <br> ${details.email}</div>
            </div>
            <div class="field">
                <div class="field-label">Address</div>
                <div class="field-value">${details.address}</div>
            </div>
            <div class="field">
                <div class="field-label">Wound Type</div>
                <div class="field-value">${details.wound_type || 'Not specified'}</div>
            </div>
             <div class="field">
                <div class="field-label">Preferred Time</div>
                <div class="field-value">${details.preferred_date || 'Any date'} at ${details.preferred_time || 'Any time'}</div>
            </div>
        `;
    } else if (type === 'referral') {
        subject = 'New Provider Referral Received';
        content = `
            <p>A new patient referral has been submitted by a provider:</p>
             <div class="field">
                <div class="field-label">Provider</div>
                <div class="field-value">${details.provider_name} (${details.provider_organization || 'No Org'})</div>
            </div>
            <div class="field">
                <div class="field-label">Patient</div>
                <div class="field-value">${details.patient_name}</div>
            </div>
             <div class="field">
                <div class="field-label">Patient Contact</div>
                <div class="field-value">${details.patient_phone}</div>
            </div>
             <div class="field">
                <div class="field-label">Urgency</div>
                <div class="field-value">${details.urgency || 'Standard'}</div>
            </div>
        `;
    } else if (type === 'contact') {
        subject = 'New Contact Form Submission';
        content = `
            <p>Someone has reached out via the contact form:</p>
            <div class="field">
                <div class="field-label">Name</div>
                <div class="field-value">${details.name}</div>
            </div>
            <div class="field">
                <div class="field-label">Subject</div>
                <div class="field-value">${details.subject || 'No Subject'}</div>
            </div>
             <div class="field">
                <div class="field-label">Message</div>
                <div class="field-value" style="background: #f8fafc; padding: 10px; border-radius: 4px; border: 1px solid #e2e8f0;">${details.message}</div>
            </div>
        `;
    }

    // Fetch Admin Email from Supabase if available
    let adminEmail = env.ADMIN_EMAIL;
    if (env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) {
        try {
            const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
            const { data, error } = await supabase
                .from('app_config')
                .select('value')
                .eq('key', 'admin_email')
                .single();

            if (data && data.value) {
                adminEmail = data.value;
            }
        } catch (err) {
            console.error('Error fetching admin email from Supabase:', err);
        }
    }

    await sendEmail(
        env.RESEND_API_KEY,
        [adminEmail],
        subject,
        emailLayout(subject, content)
    );

    return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json', "Access-Control-Allow-Origin": "*" }
    });
}

export async function handlePatientConfirmation(request: Request, env: Env) {
    const data = await request.json() as any;
    const { email, name, type } = data;

    let subject = 'We received your request';
    let content = '';

    if (type === 'visit_request') {
        subject = 'Visit Request Received';
        content = `
            <p>Hi ${name},</p>
            <p>Thank you for reaching out to Compassionate Care Advanced Wound Care Solutions. We have successfully received your request for a home visit.</p>
            <p>Our team is currently reviewing your information. We will contact you at the number provided within the next 24 hours to confirm your appointment details and answer any questions you may have.</p>
            <p>If you have any urgent concerns in the meantime, please feel free to give us a call.</p>
            <p>Warmly,<br>The Compassionate Care Team</p>
        `;
    } else if (type === 'referral') {
        subject = 'We received your referral';
        content = `
            <p>Hi ${name},</p>
            <p>We have received a referral for your wound care needs. We understand this can be a difficult time, and we are here to help.</p>
            <p>One of our specialists will be reaching out to you shortly to discuss your care plan and schedule an initial visit.</p>
             <p>Warmly,<br>The Compassionate Care Team</p>
        `;
    }

    if (email) {
        await sendEmail(
            env.RESEND_API_KEY,
            [email],
            subject,
            emailLayout(subject, content)
        );
    }

    return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json', "Access-Control-Allow-Origin": "*" }
    });
}

export async function handleCustomEmail(request: Request, env: Env) {
    const data = await request.json() as any;
    const { to, subject, message } = data;

    const formattedMessage = `<p>${message.replace(/\n/g, '<br>')}</p>`;

    await sendEmail(
        env.RESEND_API_KEY,
        [to],
        subject,
        emailLayout(subject, formattedMessage)
    );

    return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json', "Access-Control-Allow-Origin": "*" }
    });
}

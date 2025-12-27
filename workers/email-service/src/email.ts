import { createClient } from '@supabase/supabase-js';

interface Env {
    RESEND_API_KEY: string;
    ADMIN_EMAIL: string;
    SUPABASE_URL: string;
    SUPABASE_SERVICE_ROLE_KEY: string;
}

const RESEND_API_URL = 'https://api.resend.com/emails';

// Simple Email Layout
export const emailLayout = (title: string, content: string) => `
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

export async function sendEmail(
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

    const buttonStyle = 'display: inline-block; padding: 12px 24px; margin: 10px 5px 10px 0; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;';
    const secondaryButtonStyle = 'display: inline-block; padding: 12px 24px; margin: 10px 5px 10px 0; background-color: #ffffff; color: #2563eb; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; border: 2px solid #2563eb;';

    if (type === 'visit_request') {
        subject = 'New Visit Request Received';
        content = `
            <div style="text-align: center; margin-bottom: 30px;">
                <h2 style="color: #1e293b; margin-bottom: 10px;">New Patient Request</h2>
                <p style="color: #64748b; font-size: 16px;">A new request for a home visit has been submitted.</p>
            </div>
            
            <div style="background-color: #f8fafc; padding: 25px; border-radius: 12px; margin-bottom: 25px;">
                <h3 style="color: #334155; margin-top: 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 20px;">Patient Details</h3>
                
                <div class="field">
                    <div class="field-label">Patient Name</div>
                    <div class="field-value" style="font-size: 18px; color: #0f172a; font-weight: 500;">${details.patient_name}</div>
                </div>

                <div class="field">
                    <div class="field-label">Contact Information</div>
                    <div class="field-value">
                        <div style="margin-bottom: 5px;">📱 ${details.phone}</div>
                        <div>📧 ${details.email}</div>
                    </div>
                </div>

                <div class="field">
                    <div class="field-label">Preferred Contact Method</div>
                    <div class="field-value" style="display: inline-block; background-color: #e0f2fe; color: #0284c7; padding: 4px 12px; border-radius: 9999px; font-weight: 500; font-size: 14px;">
                        ${details.preferred_contact ? details.preferred_contact.charAt(0).toUpperCase() + details.preferred_contact.slice(1) : 'Not Specified'}
                    </div>
                </div>

                <div class="field">
                    <div class="field-label">Wound Details</div>
                    <div class="field-value">${details.wound_type || 'Not specified'}</div>
                </div>

                <div class="field">
                    <div class="field-label">Location</div>
                    <div class="field-value">📍 ${details.address}</div>
                </div>

                <div class="field">
                    <div class="field-label">Scheduling Preference</div>
                    <div class="field-value">
                        ${details.preferred_date || 'Any date'} ${details.preferred_time ? ' at ' + details.preferred_time : ''}
                    </div>
                </div>

                ${details.additional_notes ? `
                <div class="field">
                    <div class="field-label">Additional Notes</div>
                    <div class="field-value" style="background: #ffffff; padding: 15px; border-radius: 6px; border: 1px solid #e2e8f0; color: #475569; font-style: italic;">
                        "${details.additional_notes}"
                    </div>
                </div>
                ` : ''}
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                <p style="margin-bottom: 20px; color: #64748b; font-weight: 500;">Take Action:</p>
                <a href="tel:${details.phone.replace(/[^0-9+]/g, '')}" style="${buttonStyle}">📞 Call Patient</a>
                <a href="mailto:${details.email}" style="${secondaryButtonStyle}">✉️ Email Patient</a>
            </div>
        `;
    } else if (type === 'referral') {
        subject = 'New Provider Referral Received';
        content = `
            <div style="text-align: center; margin-bottom: 30px;">
                <h2 style="color: #1e293b; margin-bottom: 10px;">New Provider Referral</h2>
            </div>

            <div style="background-color: #f8fafc; padding: 25px; border-radius: 12px; margin-bottom: 25px;">
                <h3 style="color: #334155; margin-top: 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 20px;">Referral Info</h3>
                
                 <div class="field">
                    <div class="field-label">Provider</div>
                    <div class="field-value" style="font-weight: 500;">${details.provider_name}</div>
                    <div class="field-value" style="color: #64748b; font-size: 14px;">${details.provider_organization || 'No Organization'}</div>
                </div>

                <div style="margin: 20px 0; border-top: 1px dashed #cbd5e1;"></div>

                <div class="field">
                    <div class="field-label">Patient Name</div>
                    <div class="field-value" style="font-size: 18px; font-weight: 500;">${details.patient_name}</div>
                </div>

                 <div class="field">
                    <div class="field-label">Patient Contact</div>
                    <div class="field-value">
                         <div style="margin-bottom: 5px;">📱 ${details.patient_phone}</div>
                         ${details.patient_email ? `<div>📧 ${details.patient_email}</div>` : ''}
                    </div>
                </div>
                 
                 <div class="field">
                    <div class="field-label">Urgency</div>
                    <div class="field-value">
                        <span style="background-color: ${details.urgency === 'High' ? '#fee2e2' : '#f1f5f9'}; color: ${details.urgency === 'High' ? '#ef4444' : '#475569'}; padding: 4px 12px; border-radius: 9999px; font-weight: 600; font-size: 14px;">
                            ${details.urgency || 'Standard'}
                        </span>
                    </div>
                </div>
            </div>

             <div style="text-align: center; margin-top: 30px;">
                <a href="tel:${details.patient_phone.replace(/[^0-9+]/g, '')}" style="${buttonStyle}">📞 Call Patient</a>
            </div>
        `;
    } else if (type === 'contact') {
        subject = 'New Contact Form Submission';
        content = `
            <div style="background-color: #f8fafc; padding: 25px; border-radius: 12px;">
                <div class="field">
                    <div class="field-label">From</div>
                    <div class="field-value" style="font-size: 18px; font-weight: 500;">${details.name}</div>
                    <div class="field-value"><a href="mailto:${details.email}" style="color: #2563eb;">${details.email}</a></div>
                </div>

                <div class="field">
                    <div class="field-label">Subject</div>
                    <div class="field-value" style="font-weight: 500;">${details.subject || 'No Subject'}</div>
                </div>
                
                 <div class="field">
                    <div class="field-label">Message</div>
                    <div class="field-value" style="background: #ffffff; padding: 15px; border-radius: 6px; border: 1px solid #e2e8f0; line-height: 1.6;">${details.message}</div>
                </div>
            </div>

            <div style="text-align: center; margin-top: 30px;">
                <a href="mailto:${details.email}" style="${buttonStyle}">Reply via Email</a>
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

export async function sendAppointmentReminder(env: Env, appointment: any) {
    if (!appointment.patient_email) return;

    // formatted date
    const dateObj = new Date(appointment.appointment_date + 'T' + appointment.appointment_time);
    const dateStr = dateObj.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const timeStr = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    const subject = `Appointment Reminder: ${dateStr} at ${timeStr}`;
    const content = `
        <p>Hi ${appointment.patient_name},</p>
        <p>This is a friendly reminder for your upcoming appointment with Compassionate Care.</p>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 10px;"><strong>Date:</strong> ${dateStr}</p>
            <p style="margin: 0 0 10px;"><strong>Time:</strong> ${timeStr}</p>
            <p style="margin: 0 0 10px;"><strong>Clinician:</strong> ${appointment.clinician}</p>
            <p style="margin: 0;"><strong>Location:</strong> ${appointment.location === 'in-home' ? 'In-Home Visit' : 'Clinic'}</p>
            ${appointment.patient_address ? `<p style="margin: 10px 0 0;"><strong>Address:</strong> ${appointment.patient_address}</p>` : ''}
        </div>

        <p>If you need to reschedule to confirm, please contact us at least 24 hours in advance.</p>
        
        <p>Warmly,<br>The Compassionate Care Team</p>
    `;

    await sendEmail(
        env.RESEND_API_KEY,
        [appointment.patient_email],
        subject,
        emailLayout(subject, content)
    );
}

export async function sendAppointmentUpdateEmail(env: Env, appointment: any) {
    if (!appointment.patient_email) return;

    // formatted date
    const dateObj = new Date(appointment.appointment_date + 'T' + appointment.appointment_time);
    const dateStr = dateObj.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const timeStr = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    const subject = `Update: Your Appointment on ${dateStr}`;
    const content = `
        <p>Hi ${appointment.patient_name},</p>
        <p>Your appointment with Compassionate Care has been updated.</p>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 10px;"><strong>New Date:</strong> ${dateStr}</p>
            <p style="margin: 0 0 10px;"><strong>New Time:</strong> ${timeStr}</p>
            <p style="margin: 0 0 10px;"><strong>Clinician:</strong> ${appointment.clinician}</p>
            <p style="margin: 0;"><strong>Location:</strong> ${appointment.location === 'in-home' ? 'In-Home Visit' : 'Clinic'}</p>
            ${appointment.patient_address ? `<p style="margin: 10px 0 0;"><strong>Address:</strong> ${appointment.patient_address}</p>` : ''}
        </div>

        <p>If you have any questions, please reply to this email or call us.</p>
        
        <p>Warmly,<br>The Compassionate Care Team</p>
    `;

    await sendEmail(
        env.RESEND_API_KEY,
        [appointment.patient_email],
        subject,
        emailLayout(subject, content)
    );
}

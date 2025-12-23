-- =============================================================================
-- Email Template Seeding - Batch 2 (Branded HTML Templates)
-- =============================================================================
-- Adds high-quality HTML templates with branding colors and action buttons.
-- Brand Colors:
-- Primary (Crayola Blue): #3777ff
-- CTA (Honey Bronze): #eabc5e
-- Background (Icy Blue): #b1e5f7
-- Text (Ink Black): #00243a
-- Muted/White: #ffffff

-- Function to help insertion and avoid large blocks of repeated SQL
-- (We will insert directly to simplify portability)

-- =============================================================================
-- Email Template Seeding - Batch 2 (Branded HTML Templates)
-- =============================================================================
-- Adds high-quality HTML templates with branding colors and action buttons.
-- Brand Colors:
-- Primary (Crayola Blue): #3777ff
-- CTA (Honey Bronze): #eabc5e
-- Background (Icy Blue): #b1e5f7
-- Text (Ink Black): #00243a
-- Muted/White: #ffffff

INSERT INTO public.email_templates (name, subject, body, category, default_for_context) VALUES

-- 1. PATIENT: Welcome Email (Default for new users/registrations if applicable, or manual welcome)
('Welcome to Compassionate Care', 'Welcome to AR Advanced Woundcare Solutions', 
'<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; line-height: 1.6; color: #00243a; background-color: #f4f4f5; margin: 0; padding: 0; }
  .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
  .header { background-color: #3777ff; padding: 30px 20px; text-align: center; }
  .header img { max-height: 80px; width: auto; }
  .content { padding: 40px 30px; }
  .h1 { color: #00243a; font-size: 24px; font-weight: 700; margin-bottom: 20px; }
  .h2 { color: #3777ff; font-size: 18px; font-weight: 600; margin-top: 30px; margin-bottom: 15px; }
  .text { color: #334155; font-size: 16px; margin-bottom: 20px; }
  .btn-container { text-align: center; margin: 30px 0; }
  .footer { background-color: #00243a; padding: 20px; text-align: center; color: #94a3b8; font-size: 12px; }
  .contact-info { margin-top: 15px; border-top: 1px solid #e2e8f0; padding-top: 15px; }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <img src="{{logo_url}}" alt="AR Advanced Woundcare Solutions" style="color:white; font-size:24px; font-weight:bold;">
  </div>
  <div class="content">
    <h1 class="h1">Welcome, {{patient_name}}!</h1>
    <p class="text">Thank you for choosing <strong>AR Advanced Woundcare Solutions</strong>. We are honored to be part of your healing journey. Our team of specialists is dedicated to providing you with the highest standard of compassionate care.</p>
    
    <p class="text">We have received your information and created your patient profile.</p>

    <div class="btn-container">
      <table border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
        <tr>
          <td align="center" style="border-radius: 6px; background-color: #eabc5e; padding: 12px 24px;">
            <a href="tel:{{clinic_phone}}" style="color: #00243a; font-weight: bold; text-decoration: none; font-size: 16px; display: inline-block;">Call Us</a>
          </td>
          <td width="20"></td>
          <td align="center" style="border-radius: 6px; background-color: #f1f5f9; border: 1px solid #3777ff; padding: 12px 24px;">
             <a href="mailto:{{clinic_email}}" style="color: #3777ff; font-weight: bold; text-decoration: none; font-size: 16px; display: inline-block;">Email Support</a>
          </td>
        </tr>
      </table>
    </div>

    <div class="contact-info">
      <p class="text" style="font-size: 14px; color: #64748b;">
        <strong>Questions?</strong> We are here to help.<br>
        Mon-Fri: 8:00 AM - 6:00 PM<br>
        Sat: 9:00 AM - 2:00 PM
      </p>
    </div>
  </div>
  <div class="footer">
    &copy; {{current_year}} AR Advanced Woundcare Solutions.<br>
    All rights reserved.
  </div>
</div>
</body>
</html>', 'general', NULL),

-- 2. ADMIN: New Visit Request Notification (Send to Admin)
('New Visit Request Alert', 'New Visit Request: {{patient_name}}', 
'<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; line-height: 1.6; color: #00243a; background-color: #f4f4f5; margin: 0; padding: 0; }
  .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border-top: 5px solid #3777ff; }
  .header { padding: 20px 30px; border-bottom: 1px solid #f1f5f9; background-color: #3777ff; color: white; }
  .tag { background-color: #ffffff; color: #3777ff; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; text-transform: uppercase; float: right; margin-top: 5px;}
  .content { padding: 30px; }
  .h1 { color: #ffffff; font-size: 22px; font-weight: 700; margin-top: 0; margin-bottom: 0; }
  .field-group { margin-bottom: 15px; }
  .label { font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: 600; letter-spacing: 0.5px; }
  .value { font-size: 16px; color: #00243a; font-weight: 500; }
  .actions { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <span class="tag">New Request</span>
    <h1 class="h1">Visit Request</h1>
  </div>
  <div class="content">
    
    <div class="field-group">
      <div class="label">Patient Name</div>
      <div class="value">{{patient_name}}</div>
    </div>
    
    <!-- HIPPA: Removed Wound Details and Scheduling Preferences -->

     <div class="field-group">
      <div class="label">Received At</div>
      <div class="value">{{submission_date}}</div>
    </div>

    <div class="actions">
       <table border="0" cellspacing="0" cellpadding="0" style="width: 100%;">
        <tr>
          <td align="center" style="border-radius: 6px; background-color: #eabc5e; padding: 12px;">
            <a href="tel:{{patient_phone}}" style="color: #00243a; font-weight: bold; text-decoration: none; font-size: 14px; display: block;">Call Patient</a>
          </td>
          <td width="10"></td>
          <td align="center" style="border-radius: 6px; background-color: #3777ff; padding: 12px;">
            <a href="mailto:{{patient_email}}" style="color: #ffffff; font-weight: bold; text-decoration: none; font-size: 14px; display: block;">Email Patient</a>
          </td>
        </tr>
      </table>
    </div>
  </div>
</div>
</body>
</html>', 'notification', NULL),

-- 3. ADMIN: New Referral Notification (Send to Admin)
('New Referral Alert', 'New Provider Referral: {{provider_name}}', 
'<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; line-height: 1.6; color: #00243a; background-color: #f4f4f5; margin: 0; padding: 0; }
  .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border-top: 5px solid #3777ff; }
  .header { padding: 20px 30px; border-bottom: 1px solid #f1f5f9; background-color: #ffffff; }
  .tag { background-color: #eabc5e; color: #00243a; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; text-transform: uppercase; float: right; margin-top: 5px;}
  .content { padding: 30px; }
  .h1 { color: #00243a; font-size: 22px; font-weight: 700; margin-top: 0; }
  .section { margin-bottom: 25px; padding: 15px; background-color: #f8fafc; border-radius: 6px; }
  .section-title { font-size: 14px; font-weight: 700; color: #3777ff; margin-bottom: 10px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; }
  .key-value { display: flex; justify-content: space-between; margin-bottom: 8px; }
  .key { color: #64748b; font-size: 13px; }
  .val { color: #00243a; font-weight: 500; font-size: 13px; font-weight: 600; }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <span class="tag">New Referral</span>
    <img src="{{logo_url}}" alt="Logo" style="height: 30px; width: auto;">
  </div>
  <div class="content">
    <h1 class="h1">New Referral Received</h1>
    
    <div class="section">
      <div class="section-title">Provider Information</div>
      <div class="key-value"><span class="key">Name:</span> <span class="val">{{provider_name}}</span></div>
      <div class="key-value"><span class="key">Practice:</span> <span class="val">{{practice_name}}</span></div>
      <div class="key-value"><span class="key">Phone:</span> <span class="val">{{provider_phone}}</span></div>
      
      <div style="margin-top: 15px; text-align: center;">
         <a href="tel:{{provider_phone}}" style="color: #475569; margin-right: 15px; text-decoration: none; font-weight: 600;">Call Provider</a>
         <a href="mailto:{{provider_email}}" style="color: #475569; text-decoration: none; font-weight: 600;">Email Provider</a>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Patient Information</div>
      <div class="key-value"><span class="key">Name:</span> <span class="val">{{patient_name}}</span></div>
      <div class="key-value"><span class="key">Phone:</span> <span class="val">{{patient_phone}}</span></div>
      <div class="key-value"><span class="key">Email:</span> <span class="val">{{patient_email}}</span></div>
      
       <table border="0" cellspacing="0" cellpadding="0" style="width: 100%; margin-top: 15px;">
        <tr>
          <td align="center" style="border-radius: 6px; background-color: #3777ff; padding: 10px;">
            <a href="tel:{{patient_phone}}" style="color: #ffffff; font-weight: bold; text-decoration: none; font-size: 13px; display: block;">Call Patient</a>
          </td>
          <td width="10"></td>
          <td align="center" style="border-radius: 6px; background-color: #3777ff; padding: 10px;">
            <a href="mailto:{{patient_email}}" style="color: #ffffff; font-weight: bold; text-decoration: none; font-size: 13px; display: block;">Email Patient</a>
          </td>
        </tr>
      </table>
    </div>
  </div>
</div>
</body>
</html>', 'notification', NULL),

-- 4. PATIENT: Appointment Reminder (Send to Patient)
('Appointment Reminder (Branded)', 'Reminder: Your Appointment with AR Advanced Woundcare', 
'<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; line-height: 1.6; color: #00243a; background-color: #f4f4f5; margin: 0; padding: 0; }
  .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
  .hero { background-color: #b1e5f7; padding: 40px 20px; text-align: center; } /* Icy Blue BG */
  .hero-icon { font-size: 48px; margin-bottom: 10px; display: block; }
  .hero-title { font-size: 24px; font-weight: 700; color: #00243a; margin: 0; }
  .content { padding: 40px 30px; }
  .card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #3777ff; }
  .detail-row { display: flex; margin-bottom: 10px; justify-content: space-between; }
  .detail-label { font-weight: 600; color: #64748b; }
  .detail-val { font-weight: 500; color: #00243a; }
  .btn-container { text-align: center; margin-top: 30px; }
  .footer { text-align: center; font-size: 13px; color: #94a3b8; padding: 20px; border-top: 1px solid #f1f5f9; }
</style>
</head>
<body>
<div class="container">
  <div class="hero">
     <img src="{{icon_url}}" alt="Icon" style="width: 50px; height: 50px; margin-bottom: 10px;">
    <h1 class="hero-title">Appointment Reminder</h1>
  </div>
  <div class="content">
    <p>Hi <strong>{{patient_name}}</strong>,</p>
    <p>This is a friendly reminder about your upcoming appointment with us.</p>
    
    <div class="card">
      <div class="detail-row">
        <span class="detail-label">Date:</span>
        <span class="detail-val">{{appointment_date}}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Time:</span>
        <span class="detail-val">{{appointment_time}}</span>
      </div>
    </div>

    <p style="font-size: 14px; color: #64748b;">Please arrive 15 minutes early to complete any necessary paperwork.</p>

    <div class="btn-container">
      <table border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
        <tr>
            <td align="center" style="border-radius: 6px; background-color: #eabc5e; padding: 12px 30px;">
                <a href="tel:{{clinic_phone}}" style="color: #00243a; font-weight: bold; text-decoration: none; font-size: 16px; display: inline-block;">Call to Confirm / Reschedule</a>
            </td>
        </tr>
      </table>
    </div>
  </div>
  <div class="footer">
    AR Advanced Woundcare Solutions<br>
    <a href="tel:{{clinic_phone}}" style="color: #3777ff; text-decoration: none;">{{clinic_phone}}</a>
  </div>
</div>
</body>
</html>', 'reminder', NULL);

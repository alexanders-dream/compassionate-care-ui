-- Clear existing data (optional, be careful in production)
-- TRUNCATE TABLE public.appointments, public.visit_requests, public.provider_referrals, public.contact_submissions, public.blog_posts, public.services, public.team_members, public.testimonials, public.faqs, public.patient_resources CASCADE;

-- 1. Services
INSERT INTO public.services (title, description, icon, display_order)
VALUES
  ('Advanced Wound Care', 'Specialized treatment for chronic and complex wounds using state-of-the-art techniques.', 'Activity', 1),
  ('Debridement', 'Removal of damaged tissue to promote healing and prevent infection.', 'Scissors', 2),
  ('Compression Therapy', 'Management of venous leg ulcers and lymphedema through graduated compression.', 'Layers', 3),
  ('Infection Management', 'Diagnosis and treatment of wound infections with systemic and topical therapies.', 'Shield', 4),
  ('Diabetic Foot Care', 'Preventative and acute care for diabetic foot ulcers and complications.', 'Footprints', 5),
  ('Burn Treatment', 'Specialized care for minor to moderate burns to minimize scarring.', 'Flame', 6)
ON CONFLICT DO NOTHING;

-- 2. Team Members
INSERT INTO public.team_members (name, role, bio, image_url, display_order)
VALUES
  ('Dr. Sarah Chen', 'Chief Medical Officer', 'Board-certified wound care specialist with over 15 years of experience in chronic wound management.', 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80', 1),
  ('James Wilson, RN', 'Lead Nurse Practitioner', 'Specializes in geriatric wound care and patient education.', 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80', 2),
  ('Elena Rodriguez', 'Wound Care Specialist', 'Expert in compression therapy and diabetic foot care.', 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80', 3)
ON CONFLICT DO NOTHING;

-- 3. Testimonials
INSERT INTO public.testimonials (quote, name, role, rating, is_featured)
VALUES
  ('The care I received was exceptional. My wound healed faster than I expected thanks to the dedicated team.', 'Michael B.', 'Patient', 5, true),
  ('Professional, compassionate, and highly skilled. I would recommend them to anyone needing wound care.', 'Linda K.', 'Patient', 5, true),
  ('They saved my foot. I cannot thank Dr. Chen and her team enough for their persistence.', 'Robert T.', 'Patient', 5, true),
  ('Great service, very prompt and clean facility.', 'Emily R.', 'Patient', 4, false)
ON CONFLICT DO NOTHING;

-- 4. FAQs
INSERT INTO public.faqs (question, answer, category, display_order)
VALUES
  ('Do I need a referral?', 'While meaningful references from providers are helpful, you can also book an appointment directly with us.', 'General', 1),
  ('What insurance do you accept?', 'We accept Medicare, Medicaid, and most major private insurance plans. Please contact us for verification.', 'Billing', 2),
  ('How long does a typical visit take?', 'Initial consultations usually take 45-60 minutes, while follow-up appointments are typically 30 minutes.', 'Appointments', 3),
  ('Is parking available?', 'Yes, we have a free dedicated parking lot for our patients.', 'General', 4),
  ('What should I bring to my first appointment?', 'Please bring your ID, insurance card, list of medications, and any recent medical records.', 'Appointments', 5)
ON CONFLICT DO NOTHING;

-- 5. Blog Posts
INSERT INTO public.blog_posts (title, slug, excerpt, content, category, author, image_url, status, published_at, read_time)
VALUES
  ('Understanding Diabetic Foot Ulcers', 'understanding-diabetic-foot-ulcers', 'Learn about the causes, prevention, and treatment of diabetic foot ulcers.', 'Diabetic foot ulcers are a common complication of diabetes... (Full content would go here)', 'Education', 'Dr. Sarah Chen', 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80', 'published', NOW() - INTERVAL '10 days', '5 min read'),
  ('The Importance of Compression Therapy', 'importance-of-compression-therapy', 'Why compression therapy is a gold standard for venous leg ulcers.', 'Compression therapy works by applying pressure... (Full content would go here)', 'Treatment', 'Elena Rodriguez', 'https://images.unsplash.com/photo-1576091160550-217358c7db81?auto=format&fit=crop&q=80', 'published', NOW() - INTERVAL '5 days', '4 min read'),
  ('Nutrition for Wound Healing', 'nutrition-for-wound-healing', 'What to eat to speed up your recovery process.', 'Protein and vitamins A and C are crucial... (Full content would go here)', 'Nutrition', 'James Wilson, RN', 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80', 'draft', NULL, '3 min read')
ON CONFLICT DO NOTHING;

-- 6. Patient Resources
INSERT INTO public.patient_resources (title, description, file_url, file_name, file_size, icon)
VALUES
  ('New Patient Intake Form', 'Please fill this out before your first visit.', 'https://example.com/files/intake.pdf', 'intake_form.pdf', '245 KB', 'FileText'),
  ('Wound Care Aftercare Guide', 'Daily instructions for caring for your wound.', 'https://example.com/files/aftercare.pdf', 'aftercare_guide.pdf', '1.2 MB', 'FileText')
ON CONFLICT DO NOTHING;

-- 7. Visit Requests (Pending & Contacted)
INSERT INTO public.visit_requests (patient_name, email, phone, address, preferred_date, preferred_time, wound_type, additional_notes, status)
VALUES
  ('John Doe', 'john.doe@example.com', '555-0101', '123 Maple Ave, Springfield', '2025-12-20', 'Morning', 'Diabetic Ulcer', 'Recurring issue on left foot', 'pending'),
  ('Jane Smith', 'jane.smith@example.com', '555-0102', '456 Oak St, Springfield', '2025-12-21', 'Afternoon', 'Surgical Wound', 'Post-op infection details...', 'contacted'),
  ('Alice Johnson', 'alice.j@example.com', '555-0103', '789 Pine Ln, Springfield', '2025-12-22', 'Anytime', 'Burn', 'Second degree burn on arm.', 'contacted')
ON CONFLICT DO NOTHING;

-- 8. Provider Referrals
INSERT INTO public.provider_referrals (provider_name, provider_organization, provider_email, provider_phone, patient_name, patient_email, patient_phone, patient_address, wound_type, status)
VALUES
  ('Dr. Gregory House', 'Princeton Plainsboro', 'house@ppth.org', '555-0900', 'Kenny McCormick', 'kenny@southpark.com', '555-1111', 'South Park, CO', 'Frostbite', 'pending'),
  ('Dr. Meredith Grey', 'Grey Sloan Memorial', 'meredith@greysloan.org', '555-0901', 'Denny Duquette', 'denny@ghost.com', '555-2222', 'Seattle, WA', 'Heart Surgery Wound', 'contacted')
ON CONFLICT DO NOTHING;

-- 9. Appointments
-- Note: 'status' uses enum USER-DEFINED types as per schema.
-- We link some to visit_requests/referrals using subqueries or just unlinked for simplicity since UUIDs are random. 
-- For seeding, we'll insert standalone appointments unless we capture IDs. 
-- To make it clean, we'll just insert standalone ones for the demo.

INSERT INTO public.appointments (patient_name, patient_email, patient_phone, patient_address, appointment_date, appointment_time, clinician, status, type, location)
VALUES
  ('Michael Scott', 'michael.scott@dundermifflin.com', '555-0201', '1725 Slough Ave, Scranton', CURRENT_DATE + INTERVAL '1 day', '09:00', 'Dr. Sarah Chen', 'scheduled', 'initial', 'clinic'),
  ('Dwight Schrute', 'dwight@schrutefarms.com', '555-0202', 'Schrute Farms, PA', CURRENT_DATE + INTERVAL '2 days', '10:30', 'James Wilson, RN', 'scheduled', 'follow_up', 'in-home'),
  ('Pam Beesly', 'pam@dundermifflin.com', '555-0203', 'Scranton, PA', CURRENT_DATE - INTERVAL '2 days', '14:00', 'Elena Rodriguez', 'completed', 'consultation', 'clinic'),
  ('Jim Halpert', 'jim@dundermifflin.com', '555-0204', 'Scranton, PA', CURRENT_DATE - INTERVAL '1 day', '11:00', 'Dr. Sarah Chen', 'cancelled', 'initial', 'video')
ON CONFLICT DO NOTHING;

-- 10. Contact Submissions
INSERT INTO public.contact_submissions (name, email, phone, subject, message, is_read)
VALUES
  ('Interested User', 'user@test.com', '555-9999', 'Inquiry about services', 'Do you offer home visits for elderly patients?', false),
  ('Another User', 'user2@test.com', '555-8888', 'Billing Question', 'I have a question about my last invoice.', true)
ON CONFLICT DO NOTHING;

-- 11. Form Configs (Mock config)
INSERT INTO public.form_configs (form_name, config)
VALUES
  ('visit_request', '{"fields": [{"name": "firstName", "type": "text", "label": "First Name", "required": true}, {"name": "lastName", "type": "text", "label": "Last Name", "required": true}, {"name": "phone", "type": "tel", "label": "Phone Number", "required": true}, {"name": "email", "type": "email", "label": "Email Address", "required": true}, {"name": "address", "type": "text", "label": "Home Address", "required": true}, {"name": "preferredContact", "type": "select", "label": "Preferred Contact Method", "required": true, "options": ["phone", "text", "email"]}, {"name": "woundType", "type": "select", "label": "Wound Type", "required": true, "options": ["diabetic", "pressure", "venous", "surgical", "other"]}, {"name": "additionalInfo", "type": "textarea", "label": "Additional Information", "required": false}]}'::jsonb),
  ('provider_referral', '{"fields": [{"name": "providerName", "type": "text", "label": "Provider Name", "required": true}, {"name": "practiceName", "type": "text", "label": "Practice Name", "required": true}, {"name": "providerPhone", "type": "tel", "label": "Provider Phone", "required": true}, {"name": "providerEmail", "type": "email", "label": "Provider Email", "required": true}, {"name": "providerNPI", "type": "text", "label": "NPI Number", "required": false}, {"name": "patientFirstName", "type": "text", "label": "Patient First Name", "required": true}, {"name": "patientLastName", "type": "text", "label": "Patient Last Name", "required": true}, {"name": "patientPhone", "type": "tel", "label": "Patient Phone", "required": true}, {"name": "patientDOB", "type": "date", "label": "Date of Birth", "required": true}, {"name": "patientAddress", "type": "text", "label": "Patient Address", "required": true}, {"name": "woundType", "type": "select", "label": "Wound Type", "required": true, "options": ["diabetic", "pressure", "venous", "arterial", "surgical", "traumatic", "other"]}, {"name": "urgency", "type": "select", "label": "Urgency Level", "required": true, "options": ["routine", "soon", "urgent"]}, {"name": "clinicalNotes", "type": "textarea", "label": "Clinical Notes", "required": false}]}'::jsonb),
  ('contact_form', '{"fields": [{"name": "name", "type": "text", "label": "Full Name", "required": true}, {"name": "email", "type": "email", "label": "Email", "required": true}, {"name": "phone", "type": "tel", "label": "Phone", "required": false}, {"name": "subject", "type": "text", "label": "Subject", "required": true}, {"name": "message", "type": "textarea", "label": "Message", "required": true}]}'::jsonb)
ON CONFLICT DO NOTHING;

-- 12. Site Copy (Mock copy)
INSERT INTO public.site_copy (page, section, content)
VALUES
  ('home', 'hero', '{"headline": "Compassionate Wound Care", "subheadline": "Healing with heart and expertise."}'::jsonb),
  ('about', 'mission', '{"text": "Our mission is to provide the highest quality wound care..."}'::jsonb)
ON CONFLICT DO NOTHING;

import { handleAdminNotification, handlePatientConfirmation, handleCustomEmail, sendAppointmentReminder, sendAppointmentUpdateEmail } from './email';
import { createClient } from '@supabase/supabase-js';


interface ScheduledEvent {
	scheduledTime: number;
	cron: string;
}

interface ExecutionContext {
	waitUntil(promise: Promise<any>): void;
	passThroughOnException(): void;
}

export interface Env {
	RESEND_API_KEY: string;
	ADMIN_EMAIL: string; // Fallback
	SUPABASE_URL: string;
	SUPABASE_SERVICE_ROLE_KEY: string;
}


export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);

		// CORS Handling
		if (request.method === "OPTIONS") {
			return new Response(null, {
				headers: {
					"Access-Control-Allow-Origin": "*",
					"Access-Control-Allow-Methods": "POST, OPTIONS",
					"Access-Control-Allow-Headers": "Content-Type",
				},
			});
		}

		try {
			if (request.method === 'POST') {
				if (url.pathname === '/notify-admin') {
					return await handleAdminNotification(request, env);
				}
				if (url.pathname === '/notify-patient') {
					return await handlePatientConfirmation(request, env);
				}
				if (url.pathname === '/notify-appointment-update') {
					const data = await request.json();
					await sendAppointmentUpdateEmail(env, data);
					return new Response(JSON.stringify({ success: true }), {
						headers: { 'Content-Type': 'application/json', "Access-Control-Allow-Origin": "*" }
					});
				}
				if (url.pathname === '/send-custom') {
					return await handleCustomEmail(request, env);
				}
			}

			return new Response('Not Found', { status: 404 });
		} catch (error) {
			console.error('Worker Error:', error);
			return new Response(JSON.stringify({ error: 'Internal Server Error', details: String(error) }), {
				status: 500,
				headers: { 'Content-Type': 'application/json', "Access-Control-Allow-Origin": "*" },
			});
		}
	},

	async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
		console.log('Cron triggered', event.scheduledTime);
		const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

		try {
			// 1. Get Settings
			const { data: settings } = await supabase
				.from('app_config')
				.select('*')
				.in('key', ['enable_appointment_reminders', 'reminder_time']);

			const config: Record<string, string> = {};
			settings?.forEach((s: any) => config[s.key] = s.value);

			if (config['enable_appointment_reminders'] === 'false') {
				console.log('Reminders disabled');
				return;
			}

			const reminderHours = parseInt(config['reminder_time'] || '24');
			const now = new Date();

			// 2. Fetch upcoming scheduled appointments without reminders sent
			const todayStr = now.toISOString().split('T')[0];

			const { data: appointments, error } = await supabase
				.from('appointments')
				.select('*')
				.eq('status', 'scheduled')
				.eq('reminder_sent', false)
				.gte('appointment_date', todayStr);

			if (error) {
				console.error('Error fetching appointments', error);
				return;
			}

			// 3. Process appointments
			const promises = appointments.map(async (appt: any) => {
				const apptDateTimeStr = `${appt.appointment_date}T${appt.appointment_time}`;
				const apptTime = new Date(apptDateTimeStr);
				const timeDiff = apptTime.getTime() - now.getTime();
				const hoursDiff = timeDiff / (1000 * 60 * 60);

				// Send reminder if within the window (0 to reminderHours)
				if (hoursDiff > 0 && hoursDiff <= reminderHours) {
					console.log(`Sending reminder for appointment ${appt.id} (in ${hoursDiff.toFixed(1)} hours)`);
					try {
						await sendAppointmentReminder(env, appt);

						await supabase
							.from('appointments')
							.update({ reminder_sent: true })
							.eq('id', appt.id);
					} catch (e) {
						console.error(`Failed to send reminder for ${appt.id}`, e);
					}
				}
			});

			await Promise.all(promises);
		} catch (err) {
			console.error('Error in scheduled handler:', err);
		}
	},
};

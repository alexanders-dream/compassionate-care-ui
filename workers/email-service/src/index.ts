import { handleAdminNotification, handlePatientConfirmation, handleCustomEmail } from './email';


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
		// TODO: Implement reminder logic here
		console.log('Cron triggered', event.scheduledTime);
	},
};

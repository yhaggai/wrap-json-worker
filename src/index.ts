/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
	async fetch(request, env, ctx): Promise<Response> {
		if (request.method !== 'POST') {
			return new Response('Method Not Allowed', { status: 405 });
		}

		try {
			// ✅ Preserve original JSON string to maintain field order for signature verification
			const originalBodyText = await request.text();


			// Manually construct wrapper JSON while preserving original field order
			const wrappedJsonString = `{"payload":${originalBodyText}}`;

			const outgoingHeaders = new Headers(request.headers);
			outgoingHeaders.set('Content-Type', 'application/json');

			const upstream = await fetch(env.WEBHOOK_URL, {
				method: 'POST',
				headers: outgoingHeaders,
				body: wrappedJsonString, // ✅ Original field order preserved!
			});

			return upstream;
		} catch (err) {
			return new Response('Invalid JSON', { status: 400 });
		}
	},
} satisfies ExportedHandler<Env>;

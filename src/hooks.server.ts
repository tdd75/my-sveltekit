import type { Handle } from '@sveltejs/kit/hooks';
import { sequence } from '@sveltejs/kit/hooks';
import { paraglideMiddleware } from '#lib/paraglide/server.js';

const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		return resolve(
			{ ...event, request },
			{
				transformPageChunk: ({ html }) => html.replace('%paraglide.lang%', locale)
			}
		);
	});

// Check for auth token in cookies
const handleAuth: Handle = async ({ event, resolve }) => {
	// Check if access_token OR refresh_token cookie exists
	const accessToken = event.cookies.get('access_token');
	const refreshToken = event.cookies.get('refresh_token');

	// User is authenticated if they have either token
	// If only refresh_token exists, client will auto-refresh on first API call
	event.locals.isAuthenticated = !!(accessToken || refreshToken);

	return resolve(event);
};

// Sequence handlers
export const handle: Handle = sequence(handleAuth, handleParaglide);

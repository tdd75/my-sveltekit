import { apiURL, frontendURL } from './config';

export default async function globalSetup() {
	try {
		const response = await fetch(frontendURL, { signal: AbortSignal.timeout(5_000) });
		if (!response.ok) {
			throw new Error(`Frontend returned HTTP ${response.status}`);
		}
	} catch (cause) {
		throw new Error(
			`E2E frontend is unavailable at ${frontendURL}. Start your frontend or configure E2E_FE_URL.`,
			{ cause }
		);
	}
	try {
		const response = await fetch(`${apiURL}/api/v1/user/profile/`, {
			signal: AbortSignal.timeout(5_000)
		});
		if (!response.ok && response.status !== 401) {
			throw new Error(`API returned HTTP ${response.status}`);
		}
	} catch (cause) {
		throw new Error(
			`E2E backend is unavailable at ${apiURL}. Start your backend or configure E2E_BE_URL.`,
			{ cause }
		);
	}
}

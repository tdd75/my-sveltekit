import { afterEach, describe, expect, it, vi } from 'vitest';
import { authService, withApiHeaders } from '#lib/services/auth.js';

vi.mock('#lib/paraglide/runtime.js', () => ({
	getLocale: () => 'vi'
}));

function jsonResponse(body: unknown, init: ResponseInit = {}) {
	return new Response(JSON.stringify(body), {
		headers: { 'Content-Type': 'application/json' },
		...init
	});
}

describe('withApiHeaders', () => {
	it('preserves existing headers and adds the active locale', () => {
		const headers = withApiHeaders({ 'Content-Type': 'application/json' });

		expect(headers.get('Content-Type')).toBe('application/json');
		expect(headers.get('Accept-Language')).toBe('vi');
	});
});

// These tests replace global fetch and mock the shared service instance.
describe('authService', { concurrent: false }, () => {
	afterEach(() => {
		vi.restoreAllMocks();
		vi.unstubAllGlobals();
	});

	it('sends login credentials to the API with cookies enabled', async () => {
		const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 204 }));
		vi.stubGlobal('fetch', fetchMock);

		await authService.login({ email: 'user@example.com', password: 'secret' });

		expect(fetchMock).toHaveBeenCalledWith('http://localhost:8000/api/v1/auth/login/', {
			method: 'POST',
			headers: expect.any(Headers),
			credentials: 'include',
			body: JSON.stringify({ email: 'user@example.com', password: 'secret' })
		});
		const [, init] = fetchMock.mock.calls[0];
		expect(new Headers(init?.headers).get('Accept-Language')).toBe('vi');
	});

	it('throws the API error message when login fails', async () => {
		const fetchMock = vi
			.fn<typeof fetch>()
			.mockResolvedValue(jsonResponse({ message: 'Invalid credentials' }, { status: 401 }));
		vi.stubGlobal('fetch', fetchMock);

		await expect(
			authService.login({ email: 'user@example.com', password: 'wrong-password' })
		).rejects.toThrow('Invalid credentials');
	});

	it('refreshes the access token and retries authenticated requests after a 401', async () => {
		const fetchMock = vi
			.fn<typeof fetch>()
			.mockResolvedValueOnce(new Response(null, { status: 401 }))
			.mockResolvedValueOnce(new Response(null, { status: 204 }))
			.mockResolvedValueOnce(jsonResponse({ ok: true }, { status: 200 }));
		vi.stubGlobal('fetch', fetchMock);

		const response = await authService.authenticatedFetch(
			'http://localhost:8000/api/v1/user/profile/'
		);

		expect(response.status).toBe(200);
		expect(fetchMock).toHaveBeenCalledTimes(3);
		expect(fetchMock.mock.calls[0][0]).toBe('http://localhost:8000/api/v1/user/profile/');
		expect(fetchMock.mock.calls[1][0]).toBe('http://localhost:8000/api/v1/auth/refresh-token/');
		expect(fetchMock.mock.calls[2][0]).toBe('http://localhost:8000/api/v1/user/profile/');
		expect(fetchMock.mock.calls[0][1]?.credentials).toBe('include');
	});

	it('returns false when the auth check request fails', async () => {
		vi.spyOn(authService, 'authenticatedFetch').mockRejectedValue(new Error('network error'));

		await expect(authService.checkAuth()).resolves.toBe(false);
	});
});

import { authService, withApiHeaders } from './auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface ApiRequestOptions extends RequestInit {
	requireAuth?: boolean;
}

/**
 * API Client with automatic token refresh
 *
 * @example
 * // Authenticated request
 * const response = await apiClient.get('/api/v1/user/profile');
 *
 * @example
 * // Public request
 * const response = await apiClient.post('/api/v1/auth/login', {
 *   body: JSON.stringify({ email, password }),
 *   requireAuth: false
 * });
 */
export const apiClient = {
	async request(endpoint: string, options: ApiRequestOptions = {}): Promise<Response> {
		const { requireAuth = true, ...fetchOptions } = options;
		const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

		const headers = new Headers(fetchOptions.headers);
		if (!headers.has('Content-Type')) {
			headers.set('Content-Type', 'application/json');
		}

		const apiHeaders = withApiHeaders(headers);

		if (requireAuth) {
			return authService.authenticatedFetch(url, {
				...fetchOptions,
				headers: apiHeaders
			});
		}

		return fetch(url, {
			...fetchOptions,
			headers: apiHeaders,
			credentials: 'include' // Always include cookies
		});
	},

	async get(endpoint: string, options: ApiRequestOptions = {}): Promise<Response> {
		return this.request(endpoint, {
			...options,
			method: 'GET'
		});
	},

	async post(endpoint: string, options: ApiRequestOptions = {}): Promise<Response> {
		return this.request(endpoint, {
			...options,
			method: 'POST'
		});
	},

	async put(endpoint: string, options: ApiRequestOptions = {}): Promise<Response> {
		return this.request(endpoint, {
			...options,
			method: 'PUT'
		});
	},

	async patch(endpoint: string, options: ApiRequestOptions = {}): Promise<Response> {
		return this.request(endpoint, {
			...options,
			method: 'PATCH'
		});
	},

	async delete(endpoint: string, options: ApiRequestOptions = {}): Promise<Response> {
		return this.request(endpoint, {
			...options,
			method: 'DELETE'
		});
	}
};

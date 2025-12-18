// Authentication service for API calls
import { getLocale } from '#lib/paraglide/runtime.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface LoginRequest {
	email: string;
	password: string;
}

export interface RegisterRequest {
	email: string;
	password: string;
	first_name?: string;
	last_name?: string;
	phone?: string;
}

export interface ForgotPasswordRequest {
	email: string;
}

export interface ResetPasswordRequest {
	email: string;
	otp: string;
	new_password: string;
}

export interface TokenPair {
	access: string;
	refresh: string;
}

export interface ApiResponse<T> {
	data: T;
	message?: string;
}

export interface ApiError {
	message: string;
	errors?: Record<string, string[]>;
}

export interface UserProfile {
	id: number;
	email: string;
	first_name?: string;
	last_name?: string;
	phone?: string;
	created_at: string;
	updated_at: string;
}

export interface UpdateProfileRequest {
	first_name?: string;
	last_name?: string;
	phone?: string;
}

export interface ChangePasswordRequest {
	old_password: string;
	new_password: string;
}

export function withApiHeaders(headers?: HeadersInit): Headers {
	const mergedHeaders = new Headers(headers);
	mergedHeaders.set('Accept-Language', getLocale());

	return mergedHeaders;
}

class AuthService {
	async login(data: LoginRequest): Promise<void> {
		const response = await fetch(`${API_BASE_URL}/api/v1/auth/login/`, {
			method: 'POST',
			headers: withApiHeaders({ 'Content-Type': 'application/json' }),
			credentials: 'include', // Important: send cookies
			body: JSON.stringify(data)
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || 'Login failed');
		}

		// Tokens are set as httpOnly cookies by backend
	}

	async register(data: RegisterRequest): Promise<void> {
		const response = await fetch(`${API_BASE_URL}/api/v1/auth/register/`, {
			method: 'POST',
			headers: withApiHeaders({ 'Content-Type': 'application/json' }),
			credentials: 'include', // Important: send cookies
			body: JSON.stringify(data)
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || 'Registration failed');
		}

		// Tokens are set as httpOnly cookies by backend
	}

	async forgotPassword(data: ForgotPasswordRequest): Promise<void> {
		const response = await fetch(`${API_BASE_URL}/api/v1/auth/forgot-password/`, {
			method: 'POST',
			headers: withApiHeaders({ 'Content-Type': 'application/json' }),
			credentials: 'include',
			body: JSON.stringify(data)
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || 'Failed to send reset password email');
		}
	}

	async resetPassword(data: ResetPasswordRequest): Promise<void> {
		const response = await fetch(`${API_BASE_URL}/api/v1/auth/reset-password/`, {
			method: 'POST',
			headers: withApiHeaders({ 'Content-Type': 'application/json' }),
			credentials: 'include',
			body: JSON.stringify(data)
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || 'Failed to reset password');
		}
	}

	// Refresh access token using refresh token from cookie
	async refreshAccessToken(): Promise<void> {
		const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh-token/`, {
			method: 'POST',
			headers: withApiHeaders({ 'Content-Type': 'application/json' }),
			credentials: 'include', // Send cookies including refresh token
			body: JSON.stringify({})
		});

		if (!response.ok) {
			// If refresh fails, logout
			await this.logout();
			throw new Error('Failed to refresh token');
		}
	}

	// Logout - clear cookies on backend
	async logout(): Promise<void> {
		try {
			await fetch(`${API_BASE_URL}/api/v1/auth/logout/`, {
				method: 'POST',
				credentials: 'include'
			});
		} catch {
			// Ignore errors during logout
		}

		// Redirect to login
		if (typeof window !== 'undefined') {
			window.location.href = '/auth/login';
		}
	}

	// Check if user is authenticated (check if we can make an authenticated request)
	async checkAuth(): Promise<boolean> {
		try {
			const response = await this.authenticatedFetch(`${API_BASE_URL}/api/v1/user/profile/`);
			return response.ok;
		} catch {
			return false;
		}
	}

	// Get current user profile
	async getUserProfile(): Promise<UserProfile> {
		const response = await this.authenticatedFetch(`${API_BASE_URL}/api/v1/user/profile/`);

		if (!response.ok) {
			throw new Error('Failed to fetch user profile');
		}

		const data = await response.json();
		return data;
	}

	// Update current user profile
	async updateProfile(data: UpdateProfileRequest): Promise<UserProfile> {
		const response = await this.authenticatedFetch(`${API_BASE_URL}/api/v1/user/profile/`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || 'Failed to update profile');
		}

		const result = await response.json();
		return result;
	}

	async changePassword(data: ChangePasswordRequest): Promise<void> {
		const response = await this.authenticatedFetch(`${API_BASE_URL}/api/v1/auth/change-password/`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || 'Failed to change password');
		}
	}

	// Fetch wrapper with automatic token refresh
	async authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
		// Ensure credentials are included to send cookies
		const fetchOptions: RequestInit = {
			...options,
			headers: withApiHeaders(options.headers),
			credentials: 'include'
		};

		// First attempt with current cookies
		let response = await fetch(url, fetchOptions);

		// If unauthorized, try to refresh token and retry
		if (response.status === 401) {
			try {
				await this.refreshAccessToken();

				// Retry with refreshed cookie
				response = await fetch(url, fetchOptions);
			} catch (error) {
				// If refresh fails, redirect to login
				await this.logout();
				throw error;
			}
		}

		return response;
	}
}

export const authService = new AuthService();

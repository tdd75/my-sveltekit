import { authService } from '#lib/services/auth.js';

/**
 * Reactive authentication state store
 * Uses Svelte 5 runes for reactivity
 */
class AuthStore {
	private _isAuthenticated = $state(false);
	private _isChecking = $state(true);
	private _hasChecked = false; // Track if we've checked auth at least once

	get isAuthenticated() {
		return this._isAuthenticated;
	}

	get isChecking() {
		return this._isChecking;
	}

	async checkAuth(force = false) {
		// Skip if already checked (unless forced)
		if (this._hasChecked && !force) {
			return;
		}

		this._isChecking = true;
		try {
			this._isAuthenticated = await authService.checkAuth();
			this._hasChecked = true;
		} catch {
			this._isAuthenticated = false;
		} finally {
			this._isChecking = false;
		}
	}

	setAuthenticated(value: boolean) {
		this._isAuthenticated = value;
	}

	// Force recheck (useful after login/logout)
	async recheck() {
		this._hasChecked = false;
		await this.checkAuth(true);
	}
}

export const authStore = new AuthStore();

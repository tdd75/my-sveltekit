import { browser } from '$app/env';

type Theme = 'light' | 'dark';

class ThemeStore {
	private _theme = $state<Theme>('light');

	constructor() {
		if (browser) {
			// Initialize theme from localStorage or system preference
			const stored = localStorage.getItem('theme') as Theme | null;
			if (stored) {
				this._theme = stored;
			} else {
				// Check system preference
				this._theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
			}
			this.applyTheme();
		}
	}

	get theme() {
		return this._theme;
	}

	private applyTheme() {
		if (browser) {
			if (this._theme === 'dark') {
				document.documentElement.classList.add('dark');
			} else {
				document.documentElement.classList.remove('dark');
			}
		}
	}

	toggle() {
		this._theme = this._theme === 'light' ? 'dark' : 'light';
		if (browser) {
			localStorage.setItem('theme', this._theme);
			this.applyTheme();
		}
	}

	setTheme(theme: Theme) {
		this._theme = theme;
		if (browser) {
			localStorage.setItem('theme', this._theme);
			this.applyTheme();
		}
	}
}

export const themeStore = new ThemeStore();

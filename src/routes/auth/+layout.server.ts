import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	if (locals.isAuthenticated) {
		redirect(303, '/');
	}
};

export const load = async ({ locals }) => {
	return {
		isAuthenticated: locals.isAuthenticated
	};
};

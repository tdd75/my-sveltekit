export default {
	'*.{js,ts,svelte}': ['prettier --write', 'eslint --fix'],
	'*.{json,css,html,md}': ['prettier --write'],
	'**/.*.{json,css,html,md}': ['prettier --write']
};

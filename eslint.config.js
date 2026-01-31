// eslint.config.js
export default [
	// Ignore these folders
	{
		ignores: ['node_modules/**', 'dist/**'],
	},

	// Apply rules to all JS files
	{
		files: ['**/*.js'],
		languageOptions: {
			ecmaVersion: 2021,
			sourceType: 'module',
		},
		rules: {
			// Indentation (tabs)
			'indent': ['error', 'tab', { SwitchCase: 1 }],
			'no-tabs': 'off',

			// Formatting
			'linebreak-style': ['error', 'unix'],
			'quotes': ['error', 'single', { avoidEscape: true }],
			'semi': ['error', 'never'],
			'comma-dangle': ['error', 'always-multiline'],
			'object-curly-spacing': ['error', 'always'],
			'array-bracket-spacing': ['error', 'never'],
			'space-before-function-paren': ['error', 'never'],
			'keyword-spacing': ['error', { before: true, after: true }],
			'space-infix-ops': 'error',
			'eol-last': ['error', 'always'],
			'no-trailing-spaces': 'error',

			// Code quality
			'prefer-const': 'error',
			'no-var': 'error',
			'no-console': 'off',
		},
	},
]

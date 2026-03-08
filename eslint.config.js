import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import jestPlugin from 'eslint-plugin-jest';
import reactPlugin from 'eslint-plugin-react';
import testingLibraryPlugin from 'eslint-plugin-testing-library';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';

const config = defineConfig(
	// Ignore mock files
	{
		ignores: ['src/__mocks__/*', 'node_modules/*', 'dist/*', 'electron-build/*']
	},
	// Base recommended rules
	...tseslint.configs.recommended,
	// React recommended rules
	{
		files: ['**/*.tsx', '**/*.jsx'],
		plugins: {
			react: reactPlugin
		},
		languageOptions: {
			parserOptions: {
				ecmaFeatures: {
					jsx: true
				}
			},
			globals: {
				...globals.browser
			}
		},
		settings: {
			react: {
				version: 'detect'
			}
		},
		rules: {
			...reactPlugin.configs.recommended.rules,
			'react/display-name': 'off',
			'react/prop-types': 'off'
		}
	},
	// TypeScript files
	{
		files: ['**/*.ts', '**/*.tsx'],
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node
			}
		},
		rules: {
			'@typescript-eslint/no-explicit-any': 'off'
		}
	},
	// Jest/testing files
	{
		files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
		plugins: {
			jest: jestPlugin,
			testingLibrary: testingLibraryPlugin
		},
		languageOptions: {
			globals: {
				...globals.jest
			}
		},
		rules: {
			'jest/expect-expect': 'off',
			'testing-library/no-render-in-setup': 'off',
			'testing-library/render-result-naming-convention': 'off'
		}
	},
	// Disable all rules that conflict with prettier
	eslintConfigPrettier
);

export default config;

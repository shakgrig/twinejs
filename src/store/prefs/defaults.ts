import {PrefsState} from './prefs.types';

export const defaults = (): PrefsState => ({
	appTheme: 'system',
	codeEditorFontFamily: 'var(--font-monospaced)',
	codeEditorFontScale: 1,
	dialogWidth: 600,
	disabledStoryFormatEditorExtensions: [],
	donateShown: false,
	editorCursorBlinks: true,
	firstRunTime: Date.now(),
	lastUpdateSeen: '',
	lastUpdateCheckTime: Date.now(),
	locale:
		(globalThis.navigator as any).userLanguage ||
		globalThis.navigator.language ||
		(globalThis.navigator as any).browserLanguage ||
		(globalThis.navigator as any).systemLanguage ||
		'en-us',
	passageEditorFontFamily: 'var(--font-system)',
	passageEditorFontScale: 1,
	proofingFormat: {
		name: 'Paperthin',
		version: '1.0.0'
	},
	storyFormat: {
		name: 'Harlowe',
		version: '3.3.9'
	},
	storyFormatListFilter: 'current',
	storyListSort: 'name',
	storyListTagFilter: [],
	storyTagColors: {},
	useCodeMirror: true,
	welcomeSeen: false
});

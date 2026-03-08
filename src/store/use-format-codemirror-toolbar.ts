import CodeMirror from 'codemirror';
import * as React from 'react';
import {formatEditorExtensions, namespaceForFormat} from '../util/story-format';
import {formatEditorExtensionsDisabled, usePrefsContext} from './prefs';
import {
	formatWithNameAndVersion,
	loadFormatProperties,
	StoryFormatToolbarFactory,
	StoryFormatToolbarFactoryEnvironment,
	StoryFormatToolbarItem,
	useStoryFormatsContext
} from './story-formats';
import {getAppInfo} from '../util/app-info';

function installCodeMirrorCommands(
	editorExtensions: ReturnType<typeof formatEditorExtensions>,
	namespace: string
) {
	const commands = editorExtensions?.codeMirror?.commands;

	if (!commands) {
		return;
	}

	for (const commandName in commands) {
		const namespacedCommand = namespace + commandName;

		if (namespacedCommand in CodeMirror.commands) {
			console.warn(
				`CodeMirror already has a "${namespacedCommand}" command defined, skipping`
			);
			continue;
		}

		// Using any here because the type is defined with factory commands only.

		(CodeMirror.commands as any)[namespacedCommand] = commands[commandName];
	}
}

function namespaceToolbarItems(
	items: StoryFormatToolbarItem[],
	namespace: string
) {
	return items.reduce((result, item) => {
		switch (item.type) {
			case 'button':
				return [...result, {...item, command: namespace + item.command}];

			case 'menu': {
				if (!Array.isArray(item.items)) {
					return result;
				}

				return [
					...result,
					{
						...item,
						items: item.items
							.filter(subitem =>
								['button', 'separator'].includes(subitem.type)
							)
							.map(subitem =>
								subitem.type === 'separator'
									? subitem
									: {...subitem, command: namespace + subitem.command}
							)
					}
				];
			}

			default:
				return result;
		}
	}, [] as StoryFormatToolbarItem[]);
}

function createToolbarFactory(
	editorExtensions: ReturnType<typeof formatEditorExtensions>,
	namespace: string
) {
	const toolbar = editorExtensions?.codeMirror?.toolbar;

	if (!toolbar) {
		return;
	}

	return (
		editor: CodeMirror.Editor,
		environment: StoryFormatToolbarFactoryEnvironment
	) => {
		const items = toolbar(editor, environment);

		if (!Array.isArray(items)) {
			return [];
		}

		return namespaceToolbarItems(items, namespace);
	};
}

/**
 * Manages working with a CodeMirror toolbar for a story format, which consists
 * of:
 *
 * - (optionally, but usually) a set of CodeMirror commands
 * - A function that returns an array of objects describing the toolbar, which
 *   uses those commands for functionality
 *
 * This loads the story format if it hasn't already been loaded, and installs
 * CodeMirror commands it provides. It returns the toolbar factory function if
 * everything succeeds. Otherwise, it will return undefined.
 */
export function useFormatCodeMirrorToolbar(
	formatName: string,
	formatVersion: string
) {
	const {dispatch, formats} = useStoryFormatsContext();
	const [loaded, setLoaded] = React.useState<Record<string, boolean>>({});
	const [toolbarFunc, setToolbarFunc] =
		React.useState<StoryFormatToolbarFactory>();
	const format = formatWithNameAndVersion(formats, formatName, formatVersion);
	const {prefs} = usePrefsContext();
	const extensionsDisabled = formatEditorExtensionsDisabled(
		prefs,
		formatName,
		formatVersion
	);

	React.useEffect(() => {
		if (extensionsDisabled) {
			return;
		}

		if (format.loadState === 'unloaded') {
			dispatch(loadFormatProperties(format));
		}

		if (format.loadState !== 'loaded') {
			return;
		}

		const namespace = namespaceForFormat(format);

		if (loaded[namespace]) {
			return;
		}

		const editorExtensions = formatEditorExtensions(format, getAppInfo().version);

		installCodeMirrorCommands(editorExtensions, namespace);

		const toolbarFactory = createToolbarFactory(editorExtensions, namespace);

		if (toolbarFactory) {
			setToolbarFunc(() => toolbarFactory);
		}

		setLoaded(previous => ({...previous, [namespace]: true}));
	}, [dispatch, extensionsDisabled, format, loaded]);

	return toolbarFunc;
}

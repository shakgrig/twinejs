import {v4 as uuid} from '@lukeed/uuid';
import sortBy from 'lodash/sortBy';
import {Passage, passageDefaults, Story, storyDefaults} from '../store/stories';
import {unusedName} from './unused-name';

const linebreakRegExp = /\r?\n/;

function parsePassageHeader(headerLine: string) {
	const headerBits = /^::\s*(.*?(?:\\\s)?)\s*(\[.*?\])?\s*(\{.*?\})?\s*$/.exec(
		headerLine
	);

	if (!headerBits) {
		throw new Error(`Header line couldn't be parsed: ${headerLine}`);
	}

	const [, rawName, rawTags, rawMetadata] = headerBits;

	if (rawName.trim() === '') {
		throw new Error(
			`Passage name couldn't be found in header line: ${headerLine}`
		);
	}

	return {rawName, rawTags, rawMetadata};
}

function parsePassageTags(rawTags: string) {
	return rawTags
		.replaceAll(/^\[(.*)\]$/g, '$1')
		.split(/\s/)
		.filter(tag => tag.trim() !== '')
		.map(tag => unescapeForTweeHeader(tag));
}

function applyPassageMetadata(
	passage: Omit<Passage, 'story'>,
	rawMetadata: string
) {
	try {
		const metadata = JSON.parse(rawMetadata);

		if (typeof metadata.position === 'string') {
			const [left, top] = metadata.position.split(',').map(Number.parseFloat);

			if (typeof left === 'number' && typeof top === 'number') {
				passage.left = left;
				passage.top = top;
			} else {
				console.warn(
					`Couldn't parse passage position metadata ${metadata.position}`
				);
			}
		}

		if (typeof metadata.size === 'string') {
			const [width, height] = metadata.size.split(',').map(Number.parseFloat);

			if (typeof width === 'number' && typeof height === 'number') {
				passage.width = width;
				passage.height = height;
			} else {
				console.warn(`Couldn't parse passage size metadata ${metadata.size}`);
			}
		}
	} catch {
		console.warn(`Couldn't parse passage metadata ${rawMetadata}`);
	}
}

function removePassageByName(story: Story, name: string) {
	const index = story.passages.findIndex(passage => passage.name === name);

	if (index === -1) {
		return;
	}

	const [passage] = story.passages.splice(index, 1);

	return passage;
}

function extractScriptAndStylesheetPassages(story: Story) {
	story.passages = story.passages.filter(passage => {
		const isScript = passage.tags.includes('script');
		const isStylesheet = passage.tags.includes('stylesheet');

		if ((!isScript && !isStylesheet) || (isScript && isStylesheet)) {
			return true;
		}

		if (isScript) {
			story.script += passage.text + '\n';
		} else {
			story.stylesheet += passage.text + '\n';
		}

		return false;
	});

	story.script = story.script.trim();
	story.stylesheet = story.stylesheet.trim();
}

function applyStoryTitlePassage(story: Story) {
	const titlePassage = removePassageByName(story, 'StoryTitle');

	if (titlePassage) {
		story.name = titlePassage.text.trim();
	}
}

function applyStartPassage(story: Story, start: string) {
	const startPassage = story.passages.find(passage => passage.name === start);

	if (startPassage) {
		story.startPassage = startPassage.id;
	} else {
		console.warn(`Couldn't find start passage with name "${start}"`);
	}
}

function applyTagColors(story: Story, tagColors: any) {
	for (const tagName in tagColors) {
		if (typeof tagColors[tagName] === 'string') {
			story.tagColors[tagName] = tagColors[tagName];
		} else {
			console.warn(`Tag "${tagName}" has non-string color`);
		}
	}
}

function applyStoryDataPassage(story: Story) {
	const dataPassage = removePassageByName(story, 'StoryData');

	if (!dataPassage) {
		console.warn('No StoryData passage is present in Twee');
		return;
	}

	try {
		const {
			ifid,
			format,
			'format-version': formatVersion,
			start,
			'tag-colors': tagColors,
			zoom
		} = JSON.parse(dataPassage.text);

		if (typeof ifid === 'string') {
			story.ifid = ifid;
		}

		if (typeof format === 'string') {
			story.storyFormat = format;
		}

		if (typeof formatVersion === 'string') {
			story.storyFormatVersion = formatVersion;
		}

		if (typeof start === 'string') {
			applyStartPassage(story, start);
		}

		if (typeof tagColors === 'object') {
			applyTagColors(story, tagColors);
		}

		if (typeof zoom === 'number') {
			story.zoom = zoom;
		}
	} catch {
		console.warn(`Couldn't parse story data: ${dataPassage.text}`);
	}
}

function applyLegacyPassageGrid(story: Story) {
	if (story.passages.every(({left, top}) => left === 0 && top === 0)) {
		story.passages = story.passages.map((passage, index) => ({
			...passage,
			left: 25 + 125 * (index % 10),
			top: 25 + 125 * Math.floor(index / 10)
		}));
	}
}

/**
 * Escapes characters with special meanings in a Twee passage header (brackets,
 * curly quotes, and backslashes).
 */
export function escapeForTweeHeader(value: string) {
	return value.replaceAll('\\', '\\\\').replaceAll(/([[\]{}])/g, String.raw`\$1`);
}

/**
 * Escapes characters that would disrupt parsing of passage text, i.e. `::` at
 * the start of a line.
 */
export function escapeForTweeText(value: string) {
	return value.replaceAll(/^::/gm, String.raw`\::`);
}

/**
 * Converts a single passage to Twee.
 */
export function passageToTwee(passage: Passage) {
	const escapedName = escapeForTweeHeader(passage.name)
		.replaceAll(/^\s+/g, match => String.raw`\ `.repeat(match.length))
		.replaceAll(/\s+$/g, match => String.raw`\ `.repeat(match.length));
	const tags =
		passage.tags.length > 0
			? `[${passage.tags.map(escapeForTweeHeader).join(' ')}]`
			: undefined;
	const metadata = JSON.stringify({
		position: `${passage.left},${passage.top}`,
		size: `${passage.width},${passage.height}`
	}).replaceAll(/\s+/g, '');
	const escapedText = escapeForTweeText(passage.text);

	return `:: ${escapedName}${
		tags ? ' ' + tags : ''
	} ${metadata}\n${escapedText}\n`;
}

/**
 * Converts Twee source to a passage. If it can't be parsed, then an error is
 * thrown. If it can partially parse the passage, it will do so.
 */
export function passageFromTwee(source: string): Omit<Passage, 'story'> {
	const [headerLine, ...lines] = source.split(linebreakRegExp);
	const {rawName, rawTags, rawMetadata} = parsePassageHeader(headerLine);

	const passage: Omit<Passage, 'story'> = {
		...passageDefaults(),
		id: uuid(),
		name: unescapeForTweeHeader(
			rawName
				.replaceAll(/^(\\\s)+/g, match => ' '.repeat(match.length / 2))
				.replaceAll(/(\\\s)+$/g, match => ' '.repeat(match.length / 2))
		),
		tags: [],
		text: lines.map(unescapeForTweeText).join('\n').trim()
	};

	if (rawTags) {
		passage.tags = parsePassageTags(rawTags);
	}

	if (rawMetadata) {
		applyPassageMetadata(passage, rawMetadata);
	}

	return passage;
}

/**
 * Converts a story from Twee source.
 */
export function storyFromTwee(source: string) {
	const id = uuid();

	const story: Story = {
		...storyDefaults(),
		id,
		ifid: uuid().toUpperCase(),
		lastUpdate: new Date(),
		passages: source
			.split(/^::/m)
			.filter(s => s.trim() !== '')
			.map(s => ':: ' + s)
			.map(passageFromTwee)
			.map(passage => ({...passage, story: id})),
		script: ''
	};

		extractScriptAndStylesheetPassages(story);
		applyStoryTitlePassage(story);
		applyStoryDataPassage(story);
		applyLegacyPassageGrid(story);

	return story;
}

/**
 * Converts a story to Twee.
 */
export function storyToTwee(story: Story) {
	const storyTitle = `:: StoryTitle\n${escapeForTweeText(story.name)}`;
	const startPassage = story.passages.find(p => p.id === story.startPassage);
	const storyData = `:: StoryData\n${JSON.stringify(
		{
			ifid: story.ifid,
			format: story.storyFormat,
			'format-version': story.storyFormatVersion,
			start: startPassage?.name,
			'tag-colors':
				Object.keys(story.tagColors).length > 0 ? story.tagColors : undefined,
			zoom: story.zoom
		},
		null,
		2
	)}`;

	let result = `${storyTitle}\n\n\n${storyData}\n\n\n${sortBy(story.passages, [
		'name'
	])
		.map(passageToTwee)
		.join('\n\n')}`;

	// If the story has script or stylesheet, they need to be converted to tagged
	// passages. These passage names are not part of the Twee spec.

	const passageNames = story.passages.map(({name}) => name);

	if (story.script.trim() !== '') {
		const scriptPassageName = unusedName('StoryScript', passageNames);

		result += `\n\n:: ${scriptPassageName} [script]\n${escapeForTweeText(
			story.script
		)}`;
	}

	if (story.stylesheet.trim() !== '') {
		const stylesheetPassageName = unusedName('StoryStylesheet', passageNames);

		result += `\n\n:: ${stylesheetPassageName} [stylesheet]\n${escapeForTweeText(
			story.stylesheet
		)}`;
	}

	return result;
}

/**
 * Unescapes characters with special meanings in a Twee passage header (brackets,
 * curly quotes, and backslashes).
 */
export function unescapeForTweeHeader(value: string) {
	return value.replaceAll(/\\([[\]{}])/g, '$1').replaceAll('\\\\', '\\');
}

/**
 * Unescapes characters that would disrupt parsing of passage text, i.e. `::` at
 * the start of a line.
 */
export function unescapeForTweeText(value: string) {
	return value.replaceAll(/^\\:/gm, ':');
}

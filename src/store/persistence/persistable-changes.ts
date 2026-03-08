import {Passage, Story} from '../stories';
import {StoryFormat} from '../story-formats';

const trivialPassageProps: ReadonlySet<keyof Passage> = new Set([
	'highlighted',
	'selected'
]);
const trivialStoryProps: ReadonlySet<keyof Story> = new Set([
	'lastUpdate',
	'selected'
]);

// Loosely typing this because of the different load states possible in the type.
const trivialStoryFormatProps: ReadonlySet<string> = new Set([
	'loadError',
	'loadState',
	'properties',
	'selected'
]);

/**
 * Is a passage change persistable? e.g. is it nontrivial?
 */
export function isPersistablePassageChange(props: Partial<Passage>) {
	return Object.keys(props).some(
		key => !trivialPassageProps.has(key as keyof Passage)
	);
}

/**
 * Is a story change persistable? e.g. is it nontrivial?
 */
export function isPersistableStoryChange(props: Partial<Story>) {
	return Object.keys(props).some(
		key => !trivialStoryProps.has(key as keyof Story)
	);
}

/**
 * Is a story format persistable? e.g. is it nontrivial?
 */
export function isPersistableStoryFormatChange(props: Partial<StoryFormat>) {
	return Object.keys(props).some(
		key => !trivialStoryFormatProps.has(key as keyof StoryFormat)
	);
}

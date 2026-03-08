import {v4 as uuid} from '@lukeed/uuid';
import {passageDefaults} from '../../defaults';
import {Passage, Story} from '../../stories.types';

function describeValue(value: unknown) {
	if (typeof value === 'string') {
		return `"${value}"`;
	}

	if (
		typeof value === 'number' ||
		typeof value === 'boolean' ||
		value === null ||
		value === undefined
	) {
		return String(value);
	}

	try {
		return JSON.stringify(value);
	} catch {
		return '[unserializable-object]';
	}
}

function hasPassageIdConflict(
	parentStory: Story,
	passage: Passage,
	passageId: string
) {
	return parentStory.passages.some(
		otherPassage => otherPassage !== passage && otherPassage.id === passageId
	);
}

function repairMinimumNumericProp(
	passage: Passage,
	repairs: Partial<Passage>,
	propName: keyof Passage,
	minimum: number,
	repairedValue: number,
	detail: string
) {
	const value = passage[propName];

	if (typeof value === 'number' && value < minimum) {
		logRepair(passage, propName, repairedValue, detail);
		(repairs[propName] as Passage[typeof propName]) = repairedValue;
	}
}

function logRepair(
	passage: Passage,
	propName: keyof Passage,
	repairedValue: any,
	detail?: string
) {
	let message =
		`Repairing passage (name: "${passage.name}", id: ${passage.id}): ` +
		`setting ${propName} to ${describeValue(repairedValue)}, was ${describeValue(
			passage[propName]
		)}`;

	if (detail) {
		message += ` (${detail})`;
	}

	console.info(message);
}

export function repairPassage(passage: Passage, parentStory: Story): Passage {
	const passageDefs = passageDefaults();
	const repairs: Partial<Passage> = {};

	// Give the passage an ID if it has none.

	if (typeof passage.id !== 'string' || passage.id === '') {
		const newId = uuid();

		logRepair(passage, 'id', newId, 'was undefined or empty string');
		repairs.id = newId;
	}

	// Apply default properties to the passage.

	for (const key in passageDefs) {
		const value = passageDefs[key as keyof typeof passageDefs];
		const defKey = key as keyof typeof passageDefs;

		if (
			(typeof value === 'number' && !Number.isFinite(passage[defKey])) ||
			typeof value !== typeof passage[defKey]
		) {
			logRepair(passage, defKey, passageDefs[defKey]);
			(repairs[defKey] as Passage[typeof defKey]) = passageDefs[defKey];
		}
	}

	// Make passage coordinates 0 or greater.

	for (const pos of ['left', 'top']) {
		const posKey = pos as keyof Passage;
		repairMinimumNumericProp(passage, repairs, posKey, 0, 0, 'was negative');
	}

	// Make passage dimensions 5 or greater.

	for (const dim of ['height', 'width']) {
		const dimKey = dim as keyof Passage;
		repairMinimumNumericProp(passage, repairs, dimKey, 5, 5, 'was less than 5');
	}

	// Repair story property if it doesn't point to the parent story.

	if (passage.story !== parentStory.id) {
		logRepair(passage, 'story', parentStory.id, "didn't match parent story");
		repairs.story = parentStory.id;
	}

	// Repair ID conflicts with any other passage in the story.

	if (hasPassageIdConflict(parentStory, passage, passage.id)) {
		const newId = uuid();

		logRepair(
			passage,
			'id',
			newId,
			'conflicted with another passage in the story'
		);
		repairs.id = newId;
	}

	if (Object.keys(repairs).length > 0) {
		return {...passage, ...repairs};
	}

	return passage;
}

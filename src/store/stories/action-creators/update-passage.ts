import escapeRegExp from 'lodash/escapeRegExp';
import {storyWithId} from '../getters';
import {Passage, StoriesThunk, Story} from '../stories.types';
import {createNewlyLinkedPassages} from './create-newly-linked-passages';
import {deleteOrphanedPassages} from './delete-orphaned-passages';

export interface UpdatePassageOptions {
	dontUpdateOthers?: boolean;
}

/**
 * General update of a passage.
 */
export function updatePassage(
	story: Story,
	passage: Passage,
	props: Partial<Passage>,
	options: UpdatePassageOptions = {}
): StoriesThunk {
	if (!story.passages.some(p => p.id === passage.id)) {
		throw new Error('This passage does not belong to this story.');
	}

	if (
		'name' in props &&
		story.passages
			.filter(p => p.name === props.name)
			.some(p => p.id !== passage.id)
	) {
		throw new Error(`There is already a passage named "${props.name}".`);
	}

	return (dispatch, getState) => {
		// Do the passage update itself.

		const oldName = passage.name;
		const oldText = passage.text;

		dispatch({
			props,
			type: 'updatePassage',
			passageId: passage.id,
			storyId: story.id
		});

		// Side effects from changes.

		if (!options.dontUpdateOthers && props.text) {
			dispatch(deleteOrphanedPassages(story, passage, props.text, oldText));

			// We need to get an up-to-date version of the story so placement of new
			// passages is correct.

			const updatedStory = storyWithId(getState(), story.id);

			dispatch(
				createNewlyLinkedPassages(updatedStory, passage, props.text, oldText)
			);
		}

		if (props.name) {
			const oldNameEscaped = escapeRegExp(oldName);

			// We only need to escape $ stuff in the new name, because it will be the
			// second argument to replace(). This is a little mindbending, but the
			// purpose of this is to replace $ with $$.

			const newNameEscaped = props.name.replaceAll('$', '$$$$');

			const simpleLinkRegexp = new RegExp(
				String.raw`\[\[` + oldNameEscaped + String.raw`(\]\[.*?)?\]\]`,
				'g'
			);
			const compoundLinkRegexp = new RegExp(
				String.raw`\[\[(.*?)(\||->)` + oldNameEscaped + String.raw`(\]\[.*?)?\]\]`,
				'g'
			);
			const reverseLinkRegexp = new RegExp(
				String.raw`\[\[` + oldNameEscaped + String.raw`(<-.*?)(\]\[.*?)?\]\]`,
				'g'
			);

			story.passages.forEach(relinkedPassage => {
				if (
					simpleLinkRegexp.test(relinkedPassage.text) ||
					compoundLinkRegexp.test(relinkedPassage.text) ||
					reverseLinkRegexp.test(relinkedPassage.text)
				) {
					let newText = relinkedPassage.text;

					newText = newText.replace(
						simpleLinkRegexp,
						'[[' + newNameEscaped + '$1]]'
					);
					newText = newText.replace(
						compoundLinkRegexp,
						'[[$1$2' + newNameEscaped + '$3]]'
					);
					newText = newText.replace(
						reverseLinkRegexp,
						'[[' + newNameEscaped + '$1$2]]'
					);

					updatePassage(
						story,
						relinkedPassage,
						{text: newText},
						options
					)(dispatch, getState);
				}
			});
		}
	};
}

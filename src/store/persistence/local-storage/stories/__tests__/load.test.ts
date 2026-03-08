import {load} from '../load';
import {fakeStory} from '../../../../../test-util';

describe('stories local storage load', () => {
	beforeEach(() => globalThis.localStorage.clear());
	afterEach(() => globalThis.localStorage.clear());

	it('resolves to an array of stories', async () => {
		const state = [fakeStory(), fakeStory()];
		const passageIds: string[] = [];

		globalThis.localStorage.setItem(
			'twine-stories',
			`${state[0].id},${state[1].id}`
		);

		state.forEach(story => {
			globalThis.localStorage.setItem(
				`twine-stories-${story.id}`,
				JSON.stringify({...story, passages: undefined})
			);

			story.passages.forEach(passage => {
				passageIds.push(passage.id);
				globalThis.localStorage.setItem(
					`twine-passages-${passage.id}`,
					JSON.stringify(passage)
				);
			});
		});

		globalThis.localStorage.setItem('twine-passages', passageIds.join(','));
		expect(await load()).toEqual(state);
	});

	it('ignores blank story and passage IDs in index keys', async () => {
		const state = [fakeStory()];

		globalThis.localStorage.setItem('twine-stories', `,${state[0].id},,   ,`);
		globalThis.localStorage.setItem(
			`twine-stories-${state[0].id}`,
			JSON.stringify({...state[0], passages: undefined})
		);
		globalThis.localStorage.setItem(
			'twine-passages',
			`,${state[0].passages[0].id},,,`
		);
		globalThis.localStorage.setItem(
			`twine-passages-${state[0].passages[0].id}`,
			JSON.stringify(state[0].passages[0])
		);

		expect(await load()).toEqual(state);
	});

	it.todo('applies defaults if the persisted data is missing properties');
});

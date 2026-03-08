import {save} from '../save';
import {fakeLoadedStoryFormat} from '../../../../../test-util';

describe('story formats local storage save', () => {
	beforeEach(() => globalThis.localStorage.clear());
	afterAll(() => globalThis.localStorage.clear());

	it('saves formats to local storage', () => {
		const formats = [fakeLoadedStoryFormat(), fakeLoadedStoryFormat()];

		save(formats);

		const ids = globalThis.localStorage.getItem('twine-storyformats')!.split(',');
		const format1 = JSON.parse(
			globalThis.localStorage.getItem(`twine-storyformats-${ids[0]}`)!
		);
		const format2 = JSON.parse(
			globalThis.localStorage.getItem(`twine-storyformats-${ids[1]}`)!
		);

		// This will change IDs on us--we can't do a simple compare.

		if (format1.name === formats[0].name) {
			expect(format1).toEqual(
				expect.objectContaining({
					name: formats[0].name,
					url: formats[0].url,
					userAdded: formats[0].userAdded,
					version: formats[0].version
				})
			);
			expect(format2).toEqual(
				expect.objectContaining({
					name: formats[1].name,
					url: formats[1].url,
					userAdded: formats[1].userAdded,
					version: formats[1].version
				})
			);
		} else if (format1.name === formats[1].name) {
			expect(format1).toEqual(
				expect.objectContaining({
					name: formats[1].name,
					url: formats[1].url,
					userAdded: formats[1].userAdded,
					version: formats[1].version
				})
			);
			expect(format2).toEqual(
				expect.objectContaining({
					name: formats[0].name,
					url: formats[0].url,
					userAdded: formats[0].userAdded,
					version: formats[0].version
				})
			);
		} else {
			throw new Error('First story format not present in globalThis.localStorage.');
		}

		expect.assertions(2);
	});
});

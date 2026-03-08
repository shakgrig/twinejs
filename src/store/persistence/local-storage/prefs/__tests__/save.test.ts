import {save} from '../save';
import {fakePrefs} from '../../../../../test-util';

describe('prefs local storage save', () => {
	beforeEach(() => globalThis.localStorage.clear());
	afterAll(() => globalThis.localStorage.clear());

	it('saves preferences to local storage', () => {
		const prefs = fakePrefs();

		save(prefs);

		const ids = globalThis.localStorage.getItem('twine-prefs')!.split(',');

		expect(ids.length).toBe(Object.keys(prefs).length);

		const saved: any = {};

		ids.forEach(id => {
			const savedPref = globalThis.localStorage.getItem(`twine-prefs-${id}`);

			expect(typeof savedPref).toBe('string');
			const restored = JSON.parse(savedPref as string);

			saved[restored.name] = restored.value;
		});

		for (const key in prefs) {
			expect(saved[key]).toEqual((prefs as any)[key]);
		}
	});
});

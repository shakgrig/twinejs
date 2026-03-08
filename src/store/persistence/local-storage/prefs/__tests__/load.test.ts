import {load} from '../load';

describe('prefs local storage load', () => {
	beforeEach(() => globalThis.localStorage.clear());
	afterAll(() => globalThis.localStorage.clear());

	it('restores preferences', async () => {
		globalThis.localStorage.setItem('twine-prefs', 'mock-id,mock-id-2');
		globalThis.localStorage.setItem(
			'twine-prefs-mock-id',
			JSON.stringify({
				name: 'foo',
				id: 'mock-id',
				value: true
			})
		);
		globalThis.localStorage.setItem(
			'twine-prefs-mock-id-2',
			JSON.stringify({
				name: 'bar',
				id: 'mock-id-2',
				value: 1
			})
		);

		expect(await load()).toEqual({bar: 1, foo: true});
	});

	it('ignores blank preference IDs in the preference list', async () => {
		globalThis.localStorage.setItem('twine-prefs', ',mock-id,,   ,');
		globalThis.localStorage.setItem(
			'twine-prefs-mock-id',
			JSON.stringify({
				name: 'foo',
				id: 'mock-id',
				value: true
			})
		);

		expect(await load()).toEqual({foo: true});
	});
});

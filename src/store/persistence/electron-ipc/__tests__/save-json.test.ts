import {saveJson as saveJsonToDisk} from '../save-json';

describe('saveJson()', () => {
	afterEach(() => delete (globalThis as any).twineElectron);

	it('calls saveJson on the twineElectron global', () => {
		const saveJsonMock = jest.fn();
		const mockObject = {mock: true};

		Object.defineProperty(globalThis, 'twineElectron', {
			configurable: true,
			value: {
				saveJson: saveJsonMock
			},
			writable: true
		});

		saveJsonToDisk('test.json', mockObject);
		expect(saveJsonMock.mock.calls).toEqual([['test.json', mockObject]]);
	});

	it('throws an error if twineElectron.saveJson is undefined', () => {
		expect(() => saveJsonToDisk('test.json', {})).toThrow();
	});
});

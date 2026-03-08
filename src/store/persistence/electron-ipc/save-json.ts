import {TwineElectronWindow} from '../../../electron/shared';

export function saveJson(filename: string, data: any) {
	const {twineElectron} = globalThis as unknown as TwineElectronWindow;

	if (!twineElectron) {
		throw new Error('Electron bridge is not present on window.');
	}

	twineElectron.saveJson(filename, data);
}

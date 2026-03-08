import {PrefsState} from '../../../prefs';

export async function load(): Promise<Partial<PrefsState>> {
	const serialized = globalThis.localStorage.getItem('twine-prefs');
	const result: Partial<PrefsState> = {};

	if (!serialized) {
		return {};
	}

	serialized
		.split(',')
		.map(id => id.trim())
		.filter(Boolean)
		.forEach(id => {
		try {
			const serializedPref = globalThis.localStorage.getItem(`twine-prefs-${id}`);

			if (!serializedPref) {
				console.warn(`No preference stored at twine-prefs-${id}`);
				return;
			}

			const item = JSON.parse(serializedPref);

			(result as any)[item.name] = item.value;
		} catch (e) {
			console.warn(
				`Preference ${id} had corrupt serialized value, skipping`,
				globalThis.localStorage.getItem(`twine-prefs-${id}`),
				e
			);
		}
		});

	return result;
}

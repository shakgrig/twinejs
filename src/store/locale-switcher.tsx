// Listens to changes in the locale preference and changes i18n's language
// accordingly.

import * as React from 'react';
import {usePrefsContext} from './prefs';
import {i18n} from '../util/i18n';
import {closestAppLocale} from '../util/locales';

function i18nLocaleForAppLocale(locale: string) {
	const closest = closestAppLocale(locale);

	if (closest === 'en') {
		return 'en-US';
	}

	const [language, region] = closest.split('-');

	if (region) {
		return `${language.toLowerCase()}-${region.toUpperCase()}`;
	}

	return language.toLowerCase();
}

export const LocaleSwitcher: React.FC = () => {
	const {prefs} = usePrefsContext();

	React.useEffect(() => {
		i18n.changeLanguage(i18nLocaleForAppLocale(prefs.locale));
	}, [prefs.locale]);

	return null;
};

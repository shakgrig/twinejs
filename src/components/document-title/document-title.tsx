import * as React from 'react';
import {isElectronRenderer} from '../../util/is-electron';

export interface DocumentTitleProps {
	title: string;
}

/**
 * Sets the document title. This works around a bug with Electron and may not be
 * needed in later versions.
 */
export const DocumentTitle: React.FC<DocumentTitleProps> = ({title}) => {
	// Using `history.goBack()` doesn't seem to cause Electron to update the
	// window title bar--possibly tied to using a <HashRouter>.

	React.useEffect(() => {
		document.title = title;

		if (isElectronRenderer()) {
			const timeout = globalThis.setTimeout(() => {
				const titleEl = document.querySelector('title');

				if (titleEl) {
					titleEl.innerHTML = title;
				}
			}, 0);

			return () => globalThis.clearTimeout(timeout);
		}
	}, [title]);

	return null;
};

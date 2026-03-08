import * as React from 'react';
import {render} from '@testing-library/react';
import {DocumentTitle} from '../document-title';

describe('<DocumentTitle>', () => {
	it('sets the document title', () => {
		render(<DocumentTitle title="mock-title" />);
		expect(document.title).toBe('mock-title');
	});
});

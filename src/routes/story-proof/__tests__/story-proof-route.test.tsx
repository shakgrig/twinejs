import {render, waitFor} from '@testing-library/react';
import * as React from 'react';
import {MemoryRouter, Route, Routes} from 'react-router';
import {usePublishing} from '../../../store/use-publishing';
import {StoryProofRoute} from '../story-proof-route';

jest.mock('../../../store/use-publishing');

describe('<StoryProofRoute>', () => {
	const usePublishingMock = usePublishing as jest.Mock;

	function renderComponent(route: string) {
		return render(
			<MemoryRouter initialEntries={[route]}>
				<Routes>
					<Route path="/stories/:storyId/proof" element={<StoryProofRoute />} />
				</Routes>
			</MemoryRouter>
		);
	}

	it('replaces the DOM with a proofing version of the story in :storyId', async () => {
		const proofStory = jest.fn(
			jest.fn(() => Promise.resolve('mock-proofed-story'))
		);

		usePublishingMock.mockReturnValue({proofStory});
		renderComponent('/stories/123/proof');
		await waitFor(() =>
			expect(document.body.textContent).toBe('mock-proofed-story')
		);
		expect(proofStory.mock.calls).toEqual([['123']]);
	});

	it('shows an error message if publishing fails', async () => {
		const proofStory = jest.fn(
			jest.fn(() => Promise.reject(new Error('mock-error-message')))
		);

		usePublishingMock.mockReturnValue({proofStory});
		renderComponent('/stories/123/proof');
		await waitFor(() =>
			expect(document.body.textContent).toContain('mock-error-message')
		);
	});
});

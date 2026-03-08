import {render, waitFor} from '@testing-library/react';
import * as React from 'react';
import {MemoryRouter, Route, Routes} from 'react-router';
import {usePublishing} from '../../../store/use-publishing';
import {StoryTestRoute} from '../story-test-route';

jest.mock('../../../store/use-publishing');

describe('<StoryTestRoute>', () => {
	const usePublishingMock = usePublishing as jest.Mock;

	function renderComponent(route: string) {
		return render(
			<MemoryRouter initialEntries={[route]}>
				<Routes>
					<Route path="/stories/:storyId/test" element={<StoryTestRoute />} />
					<Route
						path="/stories/:storyId/test/:passageId"
						element={<StoryTestRoute />}
					/>
				</Routes>
			</MemoryRouter>
		);
	}

	it('replaces the DOM with a testing version of the story in :storyId', async () => {
		const publishStory = jest.fn(
			jest.fn(() => Promise.resolve('mock-published-story'))
		);

		usePublishingMock.mockReturnValue({publishStory});
		renderComponent('/stories/123/test');
		await waitFor(() =>
			expect(document.body.textContent).toBe('mock-published-story')
		);
		expect(publishStory.mock.calls).toEqual([
			['123', {formatOptions: 'debug', startId: undefined}]
		]);
	});

	it('replaces the DOM with a testing version of the story in :storyId with a start passage specified by :passageId', async () => {
		const publishStory = jest.fn(
			jest.fn(() => Promise.resolve('mock-published-story'))
		);

		usePublishingMock.mockReturnValue({publishStory});
		renderComponent('/stories/123/test/456');
		await waitFor(() =>
			expect(document.body.textContent).toBe('mock-published-story')
		);
		expect(publishStory.mock.calls).toEqual([
			['123', {formatOptions: 'debug', startId: '456'}]
		]);
	});

	it('shows an error message if publishing fails', async () => {
		const publishStory = jest.fn(
			jest.fn(() => Promise.reject(new Error('mock-error-message')))
		);

		usePublishingMock.mockReturnValue({publishStory});
		renderComponent('/stories/123/test/456');
		await waitFor(() =>
			expect(document.body.textContent).toContain('mock-error-message')
		);
	});
});

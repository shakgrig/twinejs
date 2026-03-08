import {act, render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {MemoryRouter, Route, Routes} from 'react-router';
import {Story, useStoriesContext} from '../../../store/stories';
import {
	fakeLoadedStoryFormat,
	FakeStateProvider,
	FakeStateProviderProps,
	fakeStory,
	StoryInspector
} from '../../../test-util';
import {InnerStoryEditRoute} from '../story-edit-route';
import {useZoomShortcuts} from '../use-zoom-shortcuts';

jest.mock('../toolbar/story-edit-toolbar');
jest.mock('../use-zoom-shortcuts');
jest.mock('../../../components/passage/passage-map/passage-map');

const TestStoryEditRoute: React.FC = () => {
	const {stories} = useStoriesContext();

	return (
		<MemoryRouter initialEntries={[`/stories/${stories[0].id}`]}>
			<Routes>
				<Route
					path="/stories/:storyId"
					element={
						<>
							<InnerStoryEditRoute />
							<StoryInspector />
						</>
					}
				/>
			</Routes>
		</MemoryRouter>
	);
};

describe('<StoryEditRoute>', () => {
	const useZoomShortcutsMock = useZoomShortcuts as jest.Mock;

	async function renderComponent(
		story: Story,
		contexts?: FakeStateProviderProps
	) {
		const format = fakeLoadedStoryFormat();

		format.name = story.storyFormat;
		format.version = story.storyFormatVersion;

		jest.useFakeTimers();

		const result = render(
			<FakeStateProvider
				{...contexts}
				stories={[story]}
				storyFormats={[format]}
			>
				<TestStoryEditRoute />
			</FakeStateProvider>
		);

		act(() => {
			jest.runAllTimers();
		});

		jest.useRealTimers();

		// Need this because of <PromptButton>
		await act(async () => {});
		return result;
	}

	it('sets the document title to the story name', async () => {
		const story = fakeStory();

		await renderComponent(story);
		expect(document.title).toBe(story.name);
	});

	it('displays the toolbar', async () => {
		await renderComponent(fakeStory());
		expect(screen.getByTestId('mock-story-edit-toolbar')).toBeInTheDocument();
	});

	it('displays a passage map', async () => {
		await renderComponent(fakeStory());
		expect(screen.getByTestId('mock-passage-map')).toBeInTheDocument();
	});

	it('sets up zoom keyboard shortcuts', async () => {
		await renderComponent(fakeStory());
		expect(useZoomShortcutsMock).toHaveBeenCalled();
	});

	it('is accessible', async () => {
		const {container} = await renderComponent(fakeStory());

		expect(await axe(container)).toHaveNoViolations();
	});
});

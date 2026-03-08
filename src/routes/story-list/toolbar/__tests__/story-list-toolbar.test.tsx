import {act, render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {MemoryRouter} from 'react-router';
import {FakeStateProvider} from '../../../../test-util';
import {StoryListToolbar} from '../story-list-toolbar';

describe('<StoryListToolbar>', () => {
	async function renderComponent() {
		const result = render(
			<MemoryRouter>
				<FakeStateProvider>
					<StoryListToolbar selectedStories={[]} />
				</FakeStateProvider>
			</MemoryRouter>
		);

		await act(() => Promise.resolve());
		return result;
	}

	it('displays a Story tab', async () => {
		await renderComponent();
		expect(screen.getByText('common.story')).toBeInTheDocument();
	});

	it('displays a Library tab', async () => {
		await renderComponent();
		expect(screen.getByText('routes.storyList.library')).toBeInTheDocument();
	});

	it('displays a Build tab', async () => {
		await renderComponent();
		expect(screen.getByText('common.build')).toBeInTheDocument();
	});

	it('displays a View tab', async () => {
		await renderComponent();
		expect(screen.getByText('common.view')).toBeInTheDocument();
	});

	it('displays an app tab', async () => {
		await renderComponent();
		expect(screen.getByText('common.appName')).toBeInTheDocument();
	});

	it('is accessible', async () => {
		const {container} = await renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});

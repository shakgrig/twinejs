import {fireEvent, render, screen} from '@testing-library/react';
import {createMemoryHistory, MemoryHistory} from 'history';
import {axe} from 'jest-axe';
import * as React from 'react';
import {Router} from 'react-router';
import {fakeStory} from '../../../../../test-util';
import {EditStoryButton, EditStoryButtonProps} from '../edit-story-button';

describe('<EditStoryButton>', () => {
	function renderComponent(
		props?: Partial<EditStoryButtonProps>,
		history?: MemoryHistory
	) {
			const resolvedHistory = history ?? createMemoryHistory();

		return render(
				<Router
					location={resolvedHistory.location}
					navigator={resolvedHistory}
				>
				<EditStoryButton story={fakeStory()} {...props} />
			</Router>
		);
	}

	it('is disabled if no story is provided', () => {
		renderComponent({story: undefined});
		expect(screen.getByText('common.edit')).toBeDisabled();
	});

	it('edits the story set as prop when clicked', () => {
		const history = createMemoryHistory();
		const story = fakeStory();

		renderComponent({story}, history);
		fireEvent.click(screen.getByText('common.edit'));
		expect(history.location.pathname).toBe(`/stories/${story.id}`);
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});

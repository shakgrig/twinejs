import {render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import * as ReactI18next from 'react-i18next';
import {useDonationCheck} from '../../../store/prefs/use-donation-check';
import {
	FakeStateProvider,
	FakeStateProviderProps,
	fakeStory
} from '../../../test-util';
import {InnerStoryListRoute} from '../story-list-route';

jest.mock('../toolbar/story-list-toolbar');
jest.mock('../story-cards');
jest.mock('../../../store/prefs/use-donation-check');
jest.mock('../../../components/error/safari-warning-card');

describe('<StoryListRoute>', () => {
	type UseTranslationResult = ReturnType<typeof ReactI18next.useTranslation>;

	const useDonationCheckMock = useDonationCheck as jest.Mock;
	const useTranslationMock = jest.spyOn(ReactI18next, 'useTranslation');

	function mockUseTranslation(translation: Record<string, string> = {}) {
		const {createInstance} = jest.requireActual<typeof import('i18next')>(
			'i18next'
		);
		const i18nInstance = createInstance();

		i18nInstance.init({
			fallbackLng: 'en-US',
			initImmediate: false,
			lng: 'en-US',
			resources: {
				'en-US': {
					translation
				}
			}
		});

		const tSpy = jest.spyOn(i18nInstance, 't');
		const t = i18nInstance.t.bind(i18nInstance);
		const tuple: [UseTranslationResult[0], UseTranslationResult[1], boolean] = [
			t,
			i18nInstance,
			true
		];
		const response: UseTranslationResult = Object.assign(tuple, {
			i18n: i18nInstance,
			ready: true,
			t
		});

		useTranslationMock.mockReturnValue(response);

		return tSpy;
	}

	beforeEach(() => {
		mockUseTranslation();

		useDonationCheckMock.mockReturnValue({
			shouldShowDonationPrompt: () => false
		});
	});

	function renderComponent(contexts?: FakeStateProviderProps) {
		// Using the inner component so we can mock contexts around it.

		return render(
			<FakeStateProvider {...contexts}>
				<InnerStoryListRoute />
			</FakeStateProvider>
		);
	}

	it('displays the toolbar', () => {
		renderComponent();
		expect(screen.getByTestId('mock-story-list-toolbar')).toBeInTheDocument();
	});

	it('displays a warning for Safari users', () => {
		renderComponent();
		expect(screen.getByTestId('mock-safari-warning-card')).toBeInTheDocument();
	});

	it('displays story cards if there are stories in state', () => {
		renderComponent({stories: [fakeStory()]});
		expect(screen.getByTestId('mock-story-cards')).toBeInTheDocument();
	});

	it('displays a message if there are no stories in state', () => {
		renderComponent({stories: []});
		expect(screen.queryByTestId('mock-story-cards')).not.toBeInTheDocument();
		expect(screen.getByText('routes.storyList.noStories')).toBeInTheDocument();
	});

	it('uses the explicit zero-count title key when there are no stories', () => {
		const tSpy = mockUseTranslation({
			'routes.storyList.titleCount_0': 'No Stories'
		});

		renderComponent({stories: []});
		expect(screen.getByText('No Stories')).toBeInTheDocument();
		expect(tSpy).toHaveBeenCalledWith('routes.storyList.titleCount_0');
	});

	it('uses count-based translation when there are multiple stories', () => {
		const tSpy = mockUseTranslation({
			'routes.storyList.titleCount': 'routes.storyList.titleCount:{{count}}'
		});

		renderComponent({stories: [fakeStory(), fakeStory()]});
		expect(screen.getByText('routes.storyList.titleCount:2')).toBeInTheDocument();
		expect(tSpy).toHaveBeenCalledWith('routes.storyList.titleCount', {
			count: 2
		});
	});

	it('sorts stories by name if the user pref is set to that', () => {
		const story1 = fakeStory();
		const story2 = fakeStory();

		story1.name = 'a';
		story1.lastUpdate = new Date('1/1/2000');
		story2.name = 'b';
		story2.lastUpdate = new Date('1/1/1999');
		renderComponent({
			prefs: {storyListSort: 'name'},
			stories: [story2, story1]
		});

		const storyCards = screen.getAllByTestId('mock-story-card');

		expect(storyCards.length).toBe(2);
		expect(storyCards[0].dataset.id).toBe(story1.id);
		expect(storyCards[1].dataset.id).toBe(story2.id);
	});

	it('sorts stories by reverse chronological edit order if the user pref is set to that', () => {
		const story1 = fakeStory();
		const story2 = fakeStory();

		story1.name = 'b';
		story1.lastUpdate = new Date('1/1/2000');
		story2.name = 'a';
		story2.lastUpdate = new Date('1/1/1999');
		renderComponent({
			prefs: {storyListSort: 'date'},
			stories: [story2, story1]
		});

		const storyCards = screen.getAllByTestId('mock-story-card');

		expect(storyCards.length).toBe(2);
		expect(storyCards[0].dataset.id).toBe(story1.id);
		expect(storyCards[1].dataset.id).toBe(story2.id);
	});

	it('displays a donation prompt if useDonationCheck() says it should be shown', () => {
		useDonationCheckMock.mockReturnValue({
			shouldShowDonationPrompt: () => true
		});

		renderComponent();
		expect(screen.getByText('dialogs.appDonation.title')).toBeInTheDocument();
	});

	it('does not display a donation prompt if useDonationCheck() says it should not be shown', () => {
		useDonationCheckMock.mockReturnValue({
			shouldShowDonationPrompt: () => false
		});

		renderComponent();
		expect(
			screen.queryByText('dialogs.appDonation.title')
		).not.toBeInTheDocument();
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});

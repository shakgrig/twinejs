import * as React from 'react';
import {renderHook} from '@testing-library/react';
import {fakePrefs, fakeUnloadedStoryFormat} from '../../test-util';
import {defaults, PrefsContext} from '../prefs';
import {StoriesContext} from '../stories';
import {StoryFormatsContext} from '../story-formats';
import {useStoriesRepair} from '../use-stories-repair';

interface WrapperOptions {
	allFormats: ReturnType<typeof fakeUnloadedStoryFormat>[];
	dispatch: jest.Mock;
	prefs: ReturnType<typeof fakePrefs>;
}

function makeWrapper({allFormats, dispatch, prefs}: WrapperOptions) {
	return ({children}: {children: React.ReactNode}) => {
		const prefsDispatch = React.useMemo(() => jest.fn(), []);
		const storyFormatsDispatch = React.useMemo(() => jest.fn(), []);
		const storiesContextValue = React.useMemo(
			() => ({dispatch, stories: []}),
			[dispatch]
		);
		const prefsContextValue = React.useMemo(
			() => ({prefs, dispatch: prefsDispatch}),
			[prefs, prefsDispatch]
		);
		const storyFormatsContextValue = React.useMemo(
			() => ({dispatch: storyFormatsDispatch, formats: allFormats}),
			[allFormats, storyFormatsDispatch]
		);

		return (
			<StoriesContext.Provider value={storiesContextValue}>
				<PrefsContext.Provider value={prefsContextValue}>
					<StoryFormatsContext.Provider value={storyFormatsContextValue}>
						{children}
					</StoryFormatsContext.Provider>
				</PrefsContext.Provider>
			</StoriesContext.Provider>
		);
	};
}

describe('useStoriesRepair', () => {
	it('returns a function which dispatches a repair action with the default format and all formats', () => {
		const dispatch = jest.fn();
		const format = fakeUnloadedStoryFormat();
		const allFormats = [format, fakeUnloadedStoryFormat()];
		const prefs = fakePrefs({
			storyFormat: {name: format.name, version: format.version}
		});
		const wrapper = makeWrapper({allFormats, dispatch, prefs});
		const {result} = renderHook(() => useStoriesRepair(), {wrapper});

		result.current();
		expect(dispatch.mock.calls).toEqual([
			[
				{
					allFormats,
					defaultFormat: format,
					type: 'repair'
				}
			]
		]);
	});

	it('falls back to the default story format if the user preference is for an nonexistent format', async () => {
		const dispatch = jest.fn();
		const defaultFormatProps = defaults().storyFormat;
		const defaultFormat = fakeUnloadedStoryFormat({
			name: defaultFormatProps.name,
			version: defaultFormatProps.version
		});
		const prefs = fakePrefs({
			storyFormat: {
				name: 'bad',
				version: '1.0.0'
			}
		});
		const allFormats = [defaultFormat, fakeUnloadedStoryFormat()];
		const wrapper = makeWrapper({allFormats, dispatch, prefs});

		const {result} = renderHook(() => useStoriesRepair(), {wrapper});

		result.current();
		expect(dispatch.mock.calls).toEqual([
			[
				{
					allFormats,
					defaultFormat: defaultFormat,
					type: 'repair'
				}
			]
		]);
	});

	it("does nothing if even the default story format isn't available", async () => {
		const oldError = jest.spyOn(console, 'error').mockReturnValue();
		const dispatch = jest.fn();
		const prefs = fakePrefs({
			storyFormat: {
				name: 'bad',
				version: '1.0.0'
			}
		});
		const wrapper = makeWrapper({allFormats: [], dispatch, prefs});

		const {result} = renderHook(() => useStoriesRepair(), {wrapper});

		result.current();
		expect(dispatch).not.toHaveBeenCalled();
		oldError.mockRestore();
	});
});

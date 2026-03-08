import * as React from 'react';
import {fakeLoadedStoryFormat} from '.';
import {DialogsContextProvider} from '../dialogs';
import {PrefsContext, PrefsState} from '../store/prefs';
import {reducer as prefsReducer} from '../store/prefs/reducer';
import {StoriesContext, StoriesState} from '../store/stories';
import {reducer as storiesReducer} from '../store/stories/reducer';
import {StoryFormatsContext, StoryFormatsState} from '../store/story-formats';
import {reducer as storyFormatsReducer} from '../store/story-formats/reducer';
import {Thunk, ThunkDispatch} from '../store/thunk.types';
import {UndoableStoriesContextProvider} from '../store/undoable-stories';
import {fakePrefs, fakeStory} from './fakes';

function useThunkState<S, A>(
	reducer: React.Reducer<S, A>,
	initialState: S
): [S, ThunkDispatch<S, A>] {
	const [state, baseDispatch] = React.useReducer(reducer, initialState);
	const stateRef = React.useRef(state);
	const dispatchRef = React.useRef<ThunkDispatch<S, A>>(
		((() => {
			throw new Error('Dispatch called before initialization');
		}) as unknown) as ThunkDispatch<S, A>
	);

	stateRef.current = state;

	const dispatch = React.useCallback<ThunkDispatch<S, A>>(
		((actionOrThunk: A | Thunk<S, A>) => {
			if (typeof actionOrThunk === 'function') {
				const thunk = actionOrThunk as Thunk<S, A>;

				return thunk(dispatchRef.current, () => stateRef.current);
			}

			baseDispatch(actionOrThunk);
		}) as ThunkDispatch<S, A>,
		[baseDispatch]
	);

	dispatchRef.current = dispatch;

	return [state, dispatch];
}

export interface FakeStateProviderProps {
	children?: React.ReactNode;
	prefs?: Partial<PrefsState>;
	stories?: StoriesState;
	storyFormats?: StoryFormatsState;
}

export const FakeStateProvider: React.FC<FakeStateProviderProps> = props => {
	const format = fakeLoadedStoryFormat();
	const story = fakeStory();

	story.storyFormat = format.name;
	story.storyFormatVersion = format.version;

	const [prefsState, prefsDispatch] = React.useReducer(prefsReducer, {
		...fakePrefs(),
		...props.prefs
	});
	const [storiesState, storiesDispatch] = useThunkState(
		storiesReducer,
		props.stories ?? [story]
	);
	const [storyFormatsState, storyFormatsDispatch] = useThunkState(
		storyFormatsReducer,
		props.storyFormats ?? [format]
	);
	const prefsContextValue = React.useMemo(
		() => ({dispatch: prefsDispatch, prefs: prefsState}),
		[prefsDispatch, prefsState]
	);
	const storyFormatsContextValue = React.useMemo(
		() => ({dispatch: storyFormatsDispatch, formats: storyFormatsState}),
		[storyFormatsDispatch, storyFormatsState]
	);
	const storiesContextValue = React.useMemo(
		() => ({dispatch: storiesDispatch, stories: storiesState}),
		[storiesDispatch, storiesState]
	);

	return (
		<PrefsContext.Provider value={prefsContextValue}>
			<StoryFormatsContext.Provider value={storyFormatsContextValue}>
				<StoriesContext.Provider value={storiesContextValue}>
					<UndoableStoriesContextProvider>
						<DialogsContextProvider>{props.children}</DialogsContextProvider>
					</UndoableStoriesContextProvider>
				</StoriesContext.Provider>
			</StoryFormatsContext.Provider>
		</PrefsContext.Provider>
	);
};

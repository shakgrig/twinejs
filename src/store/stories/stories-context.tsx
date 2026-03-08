import * as React from 'react';
import {usePersistence} from '../persistence/use-persistence';
import {reducer} from './reducer';
import {
	StoriesContextProps,
	StoriesAction,
	StoriesDispatch,
	StoriesThunk,
	StoriesState
} from './stories.types';
import {useStoryFormatsContext} from '../story-formats';
import {useStoreErrorReporter} from '../use-store-error-reporter';

export const StoriesContext = React.createContext<StoriesContextProps>({
	dispatch: () => {},
	stories: []
});

StoriesContext.displayName = 'Stories';

export const useStoriesContext = () => React.useContext(StoriesContext);

export const StoriesContextProvider: React.FC<React.PropsWithChildren> = props => {
	const {stories: storiesPersistence} = usePersistence();
	const {formats} = useStoryFormatsContext();
	const {reportError} = useStoreErrorReporter();
	const persistedReducer: React.Reducer<
		StoriesState,
		StoriesAction
	> = React.useMemo(
		() => (state, action) => {
			const newState = reducer(state, action);

			try {
				storiesPersistence.saveMiddleware(newState, action, formats);
			} catch (error) {
				reportError(error as Error, 'store.errors.cantPersistStories');
			}

			return newState;
		},
		[formats, reportError, storiesPersistence]
	);
	const [stories, baseDispatch] = React.useReducer(persistedReducer, [] as StoriesState);
	const storiesRef = React.useRef(stories);
	const dispatchRef = React.useRef<StoriesDispatch>(
		((() => {
			throw new Error('Stories dispatch called before initialization');
		}) as unknown) as StoriesDispatch
	);

	storiesRef.current = stories;

	const dispatch = React.useCallback<StoriesDispatch>(
		((actionOrThunk: StoriesAction | StoriesThunk) => {
			if (typeof actionOrThunk === 'function') {
				return actionOrThunk(dispatchRef.current, () => storiesRef.current);
			}

			baseDispatch(actionOrThunk);
		}) as StoriesDispatch,
		[baseDispatch]
	);

	dispatchRef.current = dispatch;

	const contextValue = React.useMemo(
		() => ({dispatch, stories}),
		[dispatch, stories]
	);

	return (
		<StoriesContext.Provider value={contextValue}>
			{props.children}
		</StoriesContext.Provider>
	);
};

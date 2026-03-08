import {v4 as uuid} from '@lukeed/uuid';
import * as React from 'react';
import {usePersistence} from '../persistence/use-persistence';
import {builtins} from './defaults';
import {
	StoryFormat,
	StoryFormatsAction,
	StoryFormatsContextProps,
	StoryFormatsDispatch,
	StoryFormatsThunk,
	StoryFormatsState
} from './story-formats.types';
import {useStoreErrorReporter} from '../use-store-error-reporter';
import {reducer} from './reducer';

const defaultBuiltins: StoryFormat[] = builtins().map(f => ({
	...f,
	id: uuid(),
	loadState: 'unloaded',
	selected: false,
	userAdded: false
}));

export const StoryFormatsContext =
	React.createContext<StoryFormatsContextProps>({
		dispatch: () => {},
		formats: []
	});

StoryFormatsContext.displayName = 'StoryFormats';

export const useStoryFormatsContext = () =>
	React.useContext(StoryFormatsContext);

export const StoryFormatsContextProvider: React.FC<React.PropsWithChildren> = props => {
	const {storyFormats} = usePersistence();
	const {reportError} = useStoreErrorReporter();
	const persistedReducer: React.Reducer<StoryFormatsState, StoryFormatsAction> =
		React.useCallback(
			(state, action) => {
				const newState = reducer(state, action);

				try {
					storyFormats.saveMiddleware(newState, action);
				} catch (error) {
					reportError(error as Error, 'store.errors.cantPersistStoryFormats');
				}
				return newState;
			},
			[reportError, storyFormats]
		);

	const [state, baseDispatch] = React.useReducer(
		persistedReducer,
		defaultBuiltins
	);
	const stateRef = React.useRef(state);
	const dispatchRef = React.useRef<StoryFormatsDispatch>(
		((() => {
			throw new Error('Story formats dispatch called before initialization');
		}) as unknown) as StoryFormatsDispatch
	);

	stateRef.current = state;

	const dispatch = React.useCallback<StoryFormatsDispatch>(
		((actionOrThunk: StoryFormatsAction | StoryFormatsThunk) => {
			if (typeof actionOrThunk === 'function') {
				return actionOrThunk(dispatchRef.current, () => stateRef.current);
			}

			baseDispatch(actionOrThunk);
		}) as StoryFormatsDispatch,
		[baseDispatch]
	);

	dispatchRef.current = dispatch;

	const contextValue = React.useMemo(
		() => ({
			dispatch,
			formats: state
		}),
		[dispatch, state]
	);

	return (
		<StoryFormatsContext.Provider value={contextValue}>
			{props.children}
		</StoryFormatsContext.Provider>
	);
};

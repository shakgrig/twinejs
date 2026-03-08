import {StoriesDispatch, StoriesState, StoriesThunk} from '../stories';
import {reverseAction} from './reverse-action';
import {StoriesActionOrThunk} from './undoable-stories.types';

/**
 * Returns a thunk to reverse a thunk's actions. **This only works with thunks
 * that dispatch all actions synchronously.**
 */
export function reverseThunk(
	thunk: StoriesThunk,
	state: StoriesState
): StoriesThunk {
	const actions: StoriesActionOrThunk[] = [];
	const dispatch: StoriesDispatch = (actionOrThunk: StoriesActionOrThunk) => {
		if (typeof actionOrThunk === 'function') {
			actions.push(reverseThunk(actionOrThunk, state));
		} else {
			actions.push(reverseAction(actionOrThunk, state));
		}
	};

	thunk(dispatch, () => state);
	return dispatch => actions.forEach(action => dispatch(action));
}

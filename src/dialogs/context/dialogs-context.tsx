import * as React from 'react';
import {reducer} from './reducer';
import {Dialogs} from './dialogs';
import {
	DialogsAction,
	DialogsDispatch,
	DialogsState,
	DialogsThunk
} from '../dialogs.types';

export interface DialogsContextProps {
	dispatch: DialogsDispatch;
	dialogs: DialogsState;
}

export const DialogsContext = React.createContext<DialogsContextProps>({
	dispatch: () => {},
	dialogs: []
});

DialogsContext.displayName = 'Dialogs';

export const useDialogsContext = () => React.useContext(DialogsContext);

export const DialogsContextProvider: React.FC<React.PropsWithChildren> = props => {
	const [dialogs, baseDispatch] = React.useReducer(reducer, [] as DialogsState);
	const dialogsRef = React.useRef(dialogs);
	const dispatchRef = React.useRef<DialogsDispatch>(
		((() => {
			throw new Error('Dialogs dispatch called before initialization');
		}) as unknown) as DialogsDispatch
	);

	dialogsRef.current = dialogs;

	const dispatch = React.useCallback<DialogsDispatch>(
		((actionOrThunk: DialogsAction | DialogsThunk) => {
			if (typeof actionOrThunk === 'function') {
				return actionOrThunk(dispatchRef.current, () => dialogsRef.current);
			}

			baseDispatch(actionOrThunk);
		}) as DialogsDispatch,
		[baseDispatch]
	);

	dispatchRef.current = dispatch;

	const contextValue = React.useMemo(
		() => ({dispatch, dialogs}),
		[dispatch, dialogs]
	);

	return (
		<DialogsContext.Provider value={contextValue}>
			{props.children}
			<Dialogs />
		</DialogsContext.Provider>
	);
};

export type Thunk<S, A, R = unknown> = (
	dispatch: ThunkDispatch<S, A>,
	getState: () => S
) => R;

export interface ThunkDispatch<S, A> {
	(action: A): void;
	<R>(action: Thunk<S, A, R>): R;
	(action: A | Thunk<S, A, unknown>): unknown;
}
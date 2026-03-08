import * as React from 'react';
import useScrollbarSize from 'react-scrollbar-size';
import {CSSTransition, TransitionGroup} from 'react-transition-group';
import {useDialogsContext} from '.';
import {Dialog} from '../dialogs.types';
import {usePrefsContext} from '../../store/prefs';
import './dialogs.css';

// Kept local to avoid introducing a circular dependency.
const DialogTransition: React.FC<React.PropsWithChildren> = props => (
	<CSSTransition classNames="pop" timeout={200} {...props}>
		{props.children}
	</CSSTransition>
);

function dialogKey(dialog: Dialog) {
	const componentName =
		dialog.component.displayName ?? dialog.component.name ?? 'dialog';
	const componentProps = dialog.props ? JSON.stringify(dialog.props) : '';

	return `${componentName}:${componentProps}`;
}

export const Dialogs: React.FC = () => {
	const {height, width} = useScrollbarSize();
	const {prefs} = usePrefsContext();
	const {dispatch, dialogs} = useDialogsContext();

	const hasUnmaximized = dialogs.some(dialog => !dialog.maximized);
	const containerStyle: React.CSSProperties = {
		paddingLeft: `calc(100% - (${prefs.dialogWidth}px + 2 * (var(--grid-size))))`,
		marginBottom: height,
		marginRight: width
	};
	const maximizedStyle: React.CSSProperties = {
		marginRight: hasUnmaximized
			? `calc(${prefs.dialogWidth}px + var(--grid-size))`
			: 0
	};

	return (
		<div className="dialogs" style={containerStyle}>
			<TransitionGroup component={null}>
				{dialogs.map((dialog, index) => {
					const managementProps = {
						collapsed: dialog.collapsed,
						highlighted: dialog.highlighted,
						maximized: dialog.maximized,
						onChangeCollapsed: (collapsed: boolean) =>
							dispatch({type: 'setDialogCollapsed', collapsed, index}),
						onChangeHighlighted: (highlighted: boolean) =>
							dispatch({type: 'setDialogHighlighted', highlighted, index}),
						onChangeMaximized: (maximized: boolean) =>
							dispatch({type: 'setDialogMaximized', maximized, index}),
						onChangeProps: (props: Record<string, any>) =>
							dispatch({type: 'setDialogProps', index, props}),
						onClose: () => dispatch({type: 'removeDialog', index})
					};

					return (
						<DialogTransition key={dialogKey(dialog)}>
							{dialog.maximized ? (
								<div className="maximized" style={maximizedStyle}>
									<dialog.component {...dialog.props} {...managementProps} />
								</div>
							) : (
								<dialog.component {...dialog.props} {...managementProps} />
							)}
						</DialogTransition>
					);
				})}
			</TransitionGroup>
		</div>
	);
};

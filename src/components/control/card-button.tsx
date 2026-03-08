import * as React from 'react';
import {usePopper} from 'react-popper';
import {CSSTransition} from 'react-transition-group';
import {FocusTrap} from 'focus-trap-react';
import {Card} from '../container/card';
import {IconButton, IconButtonProps} from './icon-button';
import './card-button.css';

export interface CardButtonProps extends IconButtonProps {
	children?: React.ReactNode;
	/**
	 * ARIA label for the card that opens.
	 */
	ariaLabel: string;
	/**
	 * Callback for when the open status of the card should change.
	 */
	onChangeOpen: (value: boolean) => void;
	/**
	 * Is the card currently open?
	 */
	open?: boolean;
}

export const CardButton: React.FC<CardButtonProps> = props => {
	const {ariaLabel, children, onChangeOpen, open, ...other} = props;
	const ignoreOutsideUntilRef = React.useRef(0);
	const [buttonEl, setButtonEl] = React.useState<HTMLButtonElement | null>(
		null
	);
	const [cardEl, setCardEl] = React.useState<HTMLDialogElement | null>(null);
	const transitionNodeRef = React.useRef<HTMLDialogElement | null>(null);
	const {styles, attributes} = usePopper(buttonEl, cardEl, {strategy: 'fixed'});

	const handleCardRef = React.useCallback((node: HTMLDialogElement | null) => {
		transitionNodeRef.current = node;
		setCardEl(node);
	}, []);

	function filterEventsOutsideFocusTrap(event: MouseEvent | TouchEvent) {
		if (Date.now() < ignoreOutsideUntilRef.current) {
			return false;
		}

		const narrowedTarget = event.target as HTMLElement;

		if (narrowedTarget === buttonEl || buttonEl?.contains(narrowedTarget)) {
			// Let the trigger button's own click handler manage open/close state.
			// Returning false here prevents focus-trap from interpreting that click
			// as an outside deactivation, which can otherwise close immediately.
			return false;
		}

		// Outside click: close explicitly here rather than relying on onDeactivate,
		// which can fire during StrictMode remount/deactivate cycles.
		onChangeOpen(false);

		return true;
	}

	function handleCancel(event: React.SyntheticEvent<HTMLDialogElement>) {
		event.preventDefault();
		onChangeOpen(false);
	}

	return (
		<span className="card-button">
			<IconButton
				onClick={() => {
					if (!open) {
						ignoreOutsideUntilRef.current = Date.now() + 100;
					}

					onChangeOpen(!open);
				}}
				{...other}
				ref={setButtonEl}
			/>
			<CSSTransition
				classNames="fade-out"
				in={open}
				mountOnEnter
				nodeRef={transitionNodeRef}
				timeout={200}
				unmountOnExit
			>
				<FocusTrap
					focusTrapOptions={{
						clickOutsideDeactivates: filterEventsOutsideFocusTrap
					}}
				>
					<dialog
						aria-label={ariaLabel}
						className="card-button-card"
						onCancel={handleCancel}
						open
						ref={handleCardRef}
						style={styles.popper}
						{...attributes.popper}
					>
						<Card floating>{children}</Card>
					</dialog>
				</FocusTrap>
			</CSSTransition>
		</span>
	);
};

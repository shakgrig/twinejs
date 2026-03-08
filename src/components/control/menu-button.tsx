import * as React from 'react';
import {usePopper} from 'react-popper';
import {CSSTransition} from 'react-transition-group';
import {ButtonBar, ButtonBarSeparator} from '../container/button-bar';
import {ButtonCard} from '../container/button-card';
import {IconEmpty} from '../image/icon';
import {IconButton, IconButtonProps} from './icon-button';
import './menu-button.css';
import {CheckboxButton} from './checkbox-button';
import {IconCheck} from '@tabler/icons-react';

export interface UncheckableLabeledMenuItem {
	disabled?: boolean;
	label: string;
	onClick: () => void;
	separator?: never;
	variant?: IconButtonProps['variant'];
}

export interface CheckableLabeledMenuItem extends UncheckableLabeledMenuItem {
	checkable: true;
	checked: boolean;
}

export type LabeledMenuItem =
	| UncheckableLabeledMenuItem
	| CheckableLabeledMenuItem;

export interface MenuSeparator {
	separator: true;
}

export interface MenuButtonProps extends Omit<IconButtonProps, 'onClick'> {
	items: (LabeledMenuItem | MenuSeparator)[];
}

export const MenuButton: React.FC<MenuButtonProps> = props => {
	const {items, ...other} = props;
	const [buttonEl, setButtonEl] = React.useState<HTMLButtonElement | null>(
		null
	);
	const [menuEl, setMenuEl] = React.useState<HTMLDivElement | null>(null);
	const [open, setOpen] = React.useState(false);
	const {styles, attributes} = usePopper(buttonEl, menuEl, {strategy: 'fixed'});
	const keyCounts = new Map<string, number>();

	function keyFor(base: string) {
		const count = (keyCounts.get(base) ?? 0) + 1;

		keyCounts.set(base, count);
		return `${base}-${count}`;
	}

	React.useEffect(() => {
		const closer = () => setOpen(false);

		if (open) {
			document.addEventListener('click', closer);
		}

		return () => document.removeEventListener('click', closer);
	}, [menuEl, open, setOpen]);

	return (
		<span className="menu-button">
			<IconButton
				{...other}
				onClick={() => setOpen(open => !open)}
				ref={setButtonEl}
			/>
			<CSSTransition
				classNames="fade-out"
				in={open}
				mountOnEnter
				timeout={200}
				unmountOnExit
			>
				<div
					className="menu-button-menu"
					ref={setMenuEl}
					style={styles.popper}
					{...attributes.popper}
				>
					<ButtonCard floating>
						<ButtonBar orientation="vertical">
							{items.map(item => {
								if (item.separator) {
									return <ButtonBarSeparator key={keyFor('separator')} />;
								}

								const itemType = 'checkable' in item ? 'checkable' : item.variant;
								const itemKey = keyFor(
									`${itemType}-${item.label}-${item.disabled ? 'disabled' : 'enabled'}`
								);

								return 'checkable' in item ? (
									<CheckboxButton
										checkedIcon={<IconCheck />}
										disabled={item.disabled}
										key={itemKey}
										label={item.label}
										onChange={item.onClick}
										uncheckedIcon={<IconEmpty />}
										value={item.checked}
									/>
								) : (
									<IconButton
										disabled={item.disabled}
										icon={<IconEmpty />}
										key={itemKey}
										label={item.label}
										onClick={item.onClick}
										variant={item.variant}
									/>
								);
							})}
						</ButtonBar>
					</ButtonCard>
				</div>
			</CSSTransition>
		</span>
	);
};

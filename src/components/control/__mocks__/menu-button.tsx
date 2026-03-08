import * as React from 'react';
import {IconButton} from '../icon-button';
import {ButtonBarSeparator} from '../../container/button-bar/button-bar-separator';
import {MenuButtonProps} from '../menu-button';
import {IconEmpty} from '../../image/icon';
import {CheckboxButton} from '../checkbox-button';

export const MenuButton: React.FC<MenuButtonProps> = ({
	disabled,
	items,
	label
}) => {
	const keyCounts = new Map<string, number>();

	function keyFor(base: string) {
		const count = (keyCounts.get(base) ?? 0) + 1;

		keyCounts.set(base, count);
		return `${base}-${count}`;
	}

	return (
		<div data-testid={`mock-menu-button-${label}`} data-disabled={disabled}>
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
		</div>
	);
};

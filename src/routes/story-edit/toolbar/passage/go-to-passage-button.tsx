import {IconFocus2} from '@tabler/icons-react';
import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconButton} from '../../../../components/control/icon-button';

export interface GoToPassageButtonProps {
	onOpenFuzzyFinder: () => void;
}

export const GoToPassageButton: React.FC<GoToPassageButtonProps> = props => {
	const {onOpenFuzzyFinder} = props;
	const {t} = useTranslation();

	return (
		<IconButton
			icon={<IconFocus2 />}
			label={t('routes.storyEdit.toolbar.goTo')}
			onClick={onOpenFuzzyFinder}
		/>
	);
};

import {IconArrowLeft} from '@tabler/icons-react';
import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {useLocation, useNavigate} from 'react-router';
import {IconButton} from '../control/icon-button';

export const BackButton: React.FC = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const {t} = useTranslation();
	const canGoBack = globalThis.history.length > 1;

	if (['/', '/stories'].includes(location.pathname)) {
		return null;
	}

	return (
		<IconButton
			icon={<IconArrowLeft />}
			variant="primary"
			label={
				canGoBack ? t('common.back') : t('routes.storyList.titleGeneric')
			}
			onClick={() => (canGoBack ? navigate(-1) : navigate('/'))}
		/>
	);
};

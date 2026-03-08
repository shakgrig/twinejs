import {IconEdit} from '@tabler/icons-react';
import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router';
import {IconButton} from '../../../../components/control/icon-button';
import {Story} from '../../../../store/stories';

export interface EditStoryButtonProps {
	story?: Story;
}

export const EditStoryButton: React.FC<EditStoryButtonProps> = ({story}) => {
	const navigate = useNavigate();
	const {t} = useTranslation();

	return (
		<IconButton
			disabled={!story}
			icon={<IconEdit />}
			label={t('common.edit')}
			onClick={() => navigate(`/stories/${story?.id}`)}
		/>
	);
};

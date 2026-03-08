import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router';
import {IconPlus} from '@tabler/icons-react';
import {usePrefsContext} from '../../../../store/prefs';
import {
	createStory,
	storyDefaults,
	useStoriesContext
} from '../../../../store/stories';
import {PromptButton} from '../../../../components/control/prompt-button';
import {unusedName} from '../../../../util/unused-name';

export const CreateStoryButton: React.FC = () => {
	const {dispatch, stories} = useStoriesContext();
	const [newName, setNewName] = React.useState(
		unusedName(
			storyDefaults().name,
			stories.map(story => story.name)
		)
	);
	const navigate = useNavigate();
	const {prefs} = usePrefsContext();
	const {t} = useTranslation();

	React.useEffect(() => {
		setNewName(currentName => {
			const existingNames = stories
				.map(story => story.name)
				.filter((name): name is string => typeof name === 'string');

			if (
				currentName.trim() === '' ||
				existingNames.some(name => name.toLowerCase() === currentName.toLowerCase())
			) {
				return unusedName(storyDefaults().name, existingNames);
			}

			return currentName;
		});
	}, [stories]);

	function validateName(value: string) {
		if (value.trim() === '') {
			return {
				valid: false,
				message: t('routes.storyList.toolbar.createStoryButton.emptyName')
			};
		}

		if (
			stories.some(
				story =>
					typeof story.name === 'string' &&
					story.name.toLowerCase() === value.toLowerCase()
			)
		) {
			return {
				valid: false,
				message: t('routes.storyList.toolbar.createStoryButton.nameConflict')
			};
		}

		return {valid: true};
	}

	function handleSubmit() {
		const validation = validateName(newName);

		if (!validation.valid) {
			return;
		}

		try {
			const id = createStory(stories, prefs, {name: newName})(
				dispatch,
				() => stories
			);

			navigate(`/stories/${id}`);
		} catch (error) {
			console.error(error);
			globalThis.alert((error as Error).message);
		}
	}

	return (
		<PromptButton
			icon={<IconPlus />}
			label={t('common.new')}
			submitLabel={t('common.create')}
			submitVariant="create"
			onChange={e => setNewName(e.target.value)}
			onSubmit={handleSubmit}
			prompt={t('routes.storyList.toolbar.createStoryButton.prompt')}
			validate={validateName}
			value={newName}
		/>
	);
};

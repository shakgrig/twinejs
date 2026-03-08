import * as React from 'react';
import {useParams} from 'react-router';
import {replaceDom} from '../../util/replace-dom';
import {usePublishing} from '../../store/use-publishing';
import {ErrorMessage} from '../../components/error';

export const StoryPlayRoute: React.FC = () => {
	const [publishError, setPublishError] = React.useState<Error>();
	const [inited, setInited] = React.useState(false);
	const {storyId} = useParams<{storyId: string}>();
	const {publishStory} = usePublishing();

	React.useEffect(() => {
		async function load() {
			if (!storyId) {
				setPublishError(new Error('Missing story id in route.'));
				return;
			}

			try {
				replaceDom(await publishStory(storyId));
			} catch (error) {
				setPublishError(error as Error);
			}
		}

		if (!inited) {
			setInited(true);
			load();
		}
	}, [inited, publishStory, storyId]);

	if (publishError) {
		return <ErrorMessage>{publishError.message}</ErrorMessage>;
	}

	return null;
};

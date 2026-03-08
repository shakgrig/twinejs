import * as React from 'react';
import {HashRouter} from 'react-router-dom';
import {Route, Routes as RouterRoutes, useLocation} from 'react-router';
import {usePrefsContext} from '../store/prefs';
import {StoryEditRoute} from './story-edit';
import {StoryListRoute} from './story-list';
import {StoryPlayRoute} from './story-play';
import {StoryProofRoute} from './story-proof';
import {StoryTestRoute} from './story-test';
import {WelcomeRoute} from './welcome';

const FallbackStoryListRoute: React.FC = () => {
	const location = useLocation();

	console.warn(
		`No route for path "${location.pathname}", rendering story list`
	);

	return <StoryListRoute />;
};

export const Routes: React.FC = () => {
	const {prefs} = usePrefsContext();

	// A <HashRouter> is used to make our lives easier--to load local story
	// formats, we need the document HREF to reflect where the HTML file is.
	// Otherwise we'd have to store the actual location somewhere, which will
	// differ between web and Electron contexts.

	return (
		<HashRouter>
			{prefs.welcomeSeen ? (
				<RouterRoutes>
					<Route path="/" element={<StoryListRoute />} />
					<Route path="/welcome" element={<WelcomeRoute />} />
					<Route path="/stories/:storyId/play" element={<StoryPlayRoute />} />
					<Route
						path="/stories/:storyId/proof"
						element={<StoryProofRoute />}
					/>
					<Route
						path="/stories/:storyId/test/:passageId"
						element={<StoryTestRoute />}
					/>
					<Route path="/stories/:storyId/test" element={<StoryTestRoute />} />
					<Route path="/stories/:storyId" element={<StoryEditRoute />} />
					<Route path="*" element={<FallbackStoryListRoute />} />
				</RouterRoutes>
			) : (
				<WelcomeRoute />
			)}
		</HashRouter>
	);
};

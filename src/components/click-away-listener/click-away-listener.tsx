import * as React from 'react';

export interface ClickAwayListenerProps {
	children?: React.ReactNode;
	ignoreSelector?: string;
	onClickAway: () => void;
}

export const ClickAwayListener: React.FC<ClickAwayListenerProps> = props => {
	const {children, ignoreSelector, onClickAway} = props;
	const containerRef = React.useRef<HTMLDivElement>(null);

	React.useEffect(() => {
		const handleClick = (event: MouseEvent) => {
			const target = event.target as HTMLElement | null;

			if (!target || !containerRef.current?.contains(target)) {
				return;
			}

			if (ignoreSelector && target.closest(ignoreSelector)) {
				return;
			}

			onClickAway();
		};

		document.addEventListener('click', handleClick);

		return () => document.removeEventListener('click', handleClick);
	}, [ignoreSelector, onClickAway]);

	return <div ref={containerRef}>{children}</div>;
};

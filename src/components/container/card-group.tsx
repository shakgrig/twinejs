import * as React from 'react';
import './card-group.css';

export type CardGroupProps =
	| ({children?: React.ReactNode} & {columns: number; maxWidth?: string})
	| ({children?: React.ReactNode} & {
			columnWidth: number | string;
			maxWidth?: string;
	  });

export const CardGroup: React.FC<CardGroupProps> = props => {
	let columnWidth: string | undefined;

	if ('columnWidth' in props) {
		if (typeof props.columnWidth === 'number') {
			columnWidth = `${props.columnWidth}px`;
		} else {
			columnWidth = props.columnWidth;
		}
	}

	const style: React.CSSProperties = {
		gridTemplateColumns:
			'columnWidth' in props
				? `repeat(auto-fit, ${columnWidth})`
				: `repeat(${props.columns}, 1fr)`,
		maxWidth: props.maxWidth ?? 'auto'
	};

	return (
		<div className="card-group" style={style}>
			{props.children}
		</div>
	);
};

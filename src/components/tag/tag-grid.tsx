import * as React from 'react';
import {TagColors} from '../../store/stories';
import './tag-grid.css';
import classNames from 'classnames';

export interface TagGridProps {
	tagColors: TagColors;
	tags: string[];
}

export const TagGrid: React.FC<TagGridProps> = React.memo(props => {
	const tags = props.tags.filter(tag => tag in props.tagColors);
	let rows: string[][] = [];
	const rowKeyCounts = new Map<string, number>();

	function keyForRow(row: string[]) {
		const base = row.join('\u001f') || 'empty';
		const count = (rowKeyCounts.get(base) ?? 0) + 1;

		rowKeyCounts.set(base, count);
		return `row-${base}-${count}`;
	}

	// If there are 2 or fewer tags, put them each in a row by themselves.
	// If there are more, split them into rows of two.

	if (tags.length > 2) {
		while (tags.length > 2) {
			rows.push(tags.splice(0, 2));
		}

		rows.push(tags);
	} else {
		rows = tags.map(tag => [tag]);
	}

	return (
		<div className={classNames('tag-grid', {hidden: rows.length === 0})}>
			{rows.map(row => (
				<span className="row" key={keyForRow(row)}>
					{row.map(tag => (
						<span
							className={`color-${props.tagColors[tag]}`}
							key={tag}
							title={tag}
						/>
					))}
				</span>
			))}
		</div>
	);
});

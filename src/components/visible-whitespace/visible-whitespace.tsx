import {IconSpace} from '@tabler/icons-react';
import * as React from 'react';

export interface VisibleWhitespaceProps {
	value: string;
}

function iconKeysFor(segment: string, prefix: 'leader' | 'trailer') {
	const counts = new Map<string, number>();

	return Array.from(segment, char => {
		const code = (char.codePointAt(0) ?? 0).toString(16);
		const count = (counts.get(code) ?? 0) + 1;

		counts.set(code, count);
		return `${prefix}-${code}-${count}`;
	});
}

/**
 * Makes leading and trailing whitespace in a string visible.
 */
export const VisibleWhitespace: React.FC<VisibleWhitespaceProps> = ({
	value
}) => {
	const leadingMatch = /^\s*/.exec(value);
	const leaders = leadingMatch ? leadingMatch[0].length : 0;
	const trailingMatch = /\s*$/.exec(value);
	const trailers = trailingMatch ? trailingMatch[0].length : 0;
	const leadingWhitespace = value.slice(0, leaders);
	const trailingWhitespace = value.slice(value.length - trailers);

	const leadingKeys = iconKeysFor(leadingWhitespace, 'leader');
	const trailingKeys = iconKeysFor(trailingWhitespace, 'trailer');

	return (
		<span className="visible-whitespace">
			{leadingKeys.map(key => (
				<IconSpace key={key} />
			))}
			{value.trim()}
			{trailingKeys.map(key => (
				<IconSpace key={key} />
			))}
		</span>
	);
};

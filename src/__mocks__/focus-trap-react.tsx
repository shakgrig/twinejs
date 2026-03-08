import * as React from 'react';

interface FocusTrapProps {
	readonly children: React.ReactNode;
}

export function FocusTrap({children}: FocusTrapProps) {
	return <>{children}</>;
}

export default FocusTrap;

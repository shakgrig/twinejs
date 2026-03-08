import * as React from 'react';
import './meter.css';

export interface MeterProps {
	children?: React.ReactNode;
	domId: string;
	percent: number;
}

export const Meter: React.FC<MeterProps> = ({children, domId, percent}) => {
	const meterValue = percent * 100;

	return (
		<div className="meter" id={domId}>
			<meter
				className="meter-native"
				max={100}
				min={0}
				value={meterValue}
				aria-labelledby={`${domId}-label`}
			>
				{meterValue}
			</meter>
			<div className="meter-bar" aria-hidden>
				<span className="filled" style={{width: percent * 100 + '%'}}></span>
			</div>
			<div className="meter-label" id={`${domId}-label`}>
				{children}
			</div>
		</div>
	);
};

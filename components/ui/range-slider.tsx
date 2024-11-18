import React, { useState, useEffect, useRef } from 'react'

interface RangeSliderProps {
	min: number
	max: number
	step: number
	defaultValue: number
	startLabel?: string
	endLabel?: string
	showPips?: boolean
	onChange?: (value: number) => void
}

const RangeSlider = ({
	min,
	max,
	step,
	defaultValue,
	startLabel,
	endLabel,
	showPips = false,
	onChange
}: RangeSliderProps) => {
	const [value, setValue] = useState(defaultValue);
	const [showTooltip, setShowTooltip] = useState(false);
	const [pips, setPips] = useState<number[]>([]);
	const rangeRef = useRef<HTMLInputElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (onChange) {
			onChange(value);
		}
	}, [value, onChange]);

	useEffect(() => {
		if (showPips) {
			const calculatePips = () => {
				const containerWidth = containerRef.current?.clientWidth || 300;
				const minPipDistance = 30; // Minimum distance between pips in pixels
				const maxPips = Math.floor(containerWidth / minPipDistance);
				const totalSteps = (max - min) / step;
				const pipStep = Math.max(Math.ceil(totalSteps / maxPips), 1) * step;

				const newPips = [];
				for (let i = min; i <= max; i += pipStep) {
					newPips.push(i);
				}
				if (newPips[newPips.length - 1] !== max) {
					newPips.push(max);
				}
				setPips(newPips);
			}

			calculatePips();
			window.addEventListener('resize', calculatePips);
			return () => window.removeEventListener('resize', calculatePips);
		}
	}, [showPips, min, max, step]);

	const percentage = ((value - min) / (max - min)) * 100;

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setValue(Number(event.target.value));
	}

	const Pip = ({ value, position }: { value: number; position: number }) => (
		<div
			className='absolute flex flex-col items-center'
			style={{ left: `${position}%` }}
		>
			<div className='w-0.5 h-1.5 bg-gray-300 rounded-full' />
			<span className='mt-1 text-xs text-gray-500'>{value}</span>
		</div>
	)

	return (
		<div className='relative w-full max-w-md mx-auto px-4 py-8' ref={containerRef}>
			{/* Start and End Labels */}
			<div className='flex justify-between mb-2'>
				{startLabel && <span className='text-sm text-gray-600'>{startLabel}</span>}
				{endLabel && <span className='text-sm text-gray-600'>{endLabel}</span>}
			</div>

			{/* Range Slider */}
			<div className='relative pt-2'>
				<input
					ref={rangeRef}
					type='range'
					min={min}
					max={max}
					step={step}
					value={value}
					onChange={handleChange}
					className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer'
					onMouseEnter={() => setShowTooltip(true)}
					onMouseLeave={() => setShowTooltip(false)}
					style={{
						background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`,
						WebkitAppearance: 'none'
					}}
				/>

				{/* Custom Thumb and Tooltip */}
				<div
					className='absolute w-6 h-6 bg-white border-2 border-blue-500 rounded-full top-0 -mt-2 transform -translate-x-1/2'
					style={{ left: `${percentage}%` }}
				>
					{showTooltip && (
						<div className='absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-1 flex flex-col items-center'>
							<div className='bg-blue-500 text-white px-2 py-1 rounded-t-lg text-xs whitespace-nowrap'>
								{value}
							</div>
							<div
								className='w-3 h-3 bg-blue-500'
								style={{
									clipPath: 'polygon(50% 100%, 0 0, 100% 0)'
								}}
							/>
						</div>
					)}
				</div>

				{/* Pips */}
				{showPips && (
					<div className='absolute w-full top-full mt-1'>
						{pips.map(pipValue => (
							<Pip
								key={pipValue}
								value={pipValue}
								position={((pipValue - min) / (max - min)) * 100}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	)
};

export { RangeSlider };

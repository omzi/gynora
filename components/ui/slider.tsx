'use client';

import { cn } from '#/lib/utils';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { ComponentPropsWithoutRef, ElementRef, forwardRef, useEffect, useRef, useState } from 'react';

interface SliderProps extends ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
	startLabel?: string
	endLabel?: string
	showPips?: boolean
}

const Slider = forwardRef<
	ElementRef<typeof SliderPrimitive.Root>,
	SliderProps
>(({ className, startLabel, endLabel, showPips, ...props }, ref) => {
	const [value, setValue] = useState(props.defaultValue || [0]);
	const [showTooltip, setShowTooltip] = useState(false);
	const [pips, setPips] = useState<number[]>([]);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (showPips) {
			const calculatePips = () => {
				const containerWidth = containerRef.current?.clientWidth || 300;
				const minPipDistance = 30 // Minimum distance between pips in pixels
				const maxPips = Math.floor(containerWidth / minPipDistance);
				const totalSteps = (props.max || 100) - (props.min || 0);
				const pipStep = Math.max(Math.ceil(totalSteps / maxPips), 1);

				const newPips = [];
				for (let i = props.min || 0; i <= (props.max || 100); i += pipStep) {
					newPips.push(i);
				}
				if (newPips[newPips.length - 1] !== (props.max || 100)) {
					newPips.push(props.max || 100);
				}
				setPips(newPips);
			}

			calculatePips();
			window.addEventListener('resize', calculatePips);
			return () => window.removeEventListener('resize', calculatePips);
		}
	}, [showPips, props.min, props.max]);

	const handleValueChange = (newValue: number[]) => {
		console.log('newValue :>>', newValue);
		setValue(newValue);
		if (props.onValueChange) {
			props.onValueChange(newValue);
		}
	};

	return (
		<div ref={containerRef} className='relative w-full'>
			{/* Start and End Labels */}
			<div className='flex justify-between mb-4'>
				{startLabel && <span className='text-sm text-muted-foreground'>{startLabel}</span>}
				{endLabel && <span className='text-sm text-muted-foreground'>{endLabel}</span>}
			</div>

			<SliderPrimitive.Root
				ref={ref}
				className={cn(
					'relative flex w-full touch-none select-none items-center',
					className
				)}
				onValueChange={handleValueChange}
				{...props}
			>
				<SliderPrimitive.Track className='relative h-2.5 w-full grow overflow-hidden rounded-full bg-gray-600'>
					<SliderPrimitive.Range className='absolute h-full bg-white' />
				</SliderPrimitive.Track>
				<SliderPrimitive.Thumb className='block h-6 w-6 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50' />
			</SliderPrimitive.Root>

			{/* Pips */}
			{showPips && (
				<div className='w-full mt-4 px-2 flex justify-between'>
					{pips.map(pipValue => (
						<div key={pipValue} className='w-0.5 h-1.5 bg-gray-600 mt-1' />
					))}
				</div>
			)}
		</div>
	)
});
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };

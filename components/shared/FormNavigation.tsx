import React from 'react';
import Loader from 'react-ts-loaders';
import { StepsType, cn } from '#/lib/utils';
import { Button } from '#/components/ui/button';
import { CheckIcon, ChevronLeft, ChevronRight } from 'lucide-react';

type FormStepNavigationProps = {
	previous: () => void;
	next: () => void;
	currentStep: number;
	steps: StepsType;
	isSubmitting: boolean;
	isValid: boolean;
};

const FormStepNavigation: React.FC<FormStepNavigationProps> = ({
	previous,
	next,
	currentStep,
	steps,
	isSubmitting,
	isValid
}) => {
	return (
		<div className='flex flex-row items-center justify-center my-4 gap-x-4'>
			<Button
				size='lg'
				onClick={previous}
				type='button'
				disabled={currentStep === 0 || isSubmitting}
				className='flex-1 transition-colors duration-300 text-base bg-core hover:bg-purple-600'
			>
				<ChevronLeft className='w-5 h-5 mr-2' />
				Previous
			</Button>
			{currentStep === steps.length - 1 ? (
				<Button
					size='lg'
					type='submit'
					disabled={!isValid || isSubmitting}
					className='relative flex-1 transition-colors duration-300 text-base bg-core hover:bg-purple-600'
				>
					<span className={cn('opacity-100 flex items-center', isSubmitting && 'opacity-0')}>
						Save
						<CheckIcon className='w-5 h-5 ml-2' />
					</span>
					{isSubmitting && (
						<div className='absolute flex items-center justify-center w-full h-full'>
							<Loader type='spinner' size={28} className='text-white leading-[0]' />
						</div>
					)}
				</Button>
			) : (
				<Button
					size='lg'
					type='button'
					onClick={next}
					disabled={currentStep === steps.length - 1 || isSubmitting}
					className='relative flex-1 transition-colors duration-300 text-base bg-core hover:bg-purple-600'
				>
					<span className={cn('opacity-100 flex items-center', isSubmitting && 'opacity-0')}>
						Next
						<ChevronRight className='w-5 h-5 ml-2' />
					</span>
					{isSubmitting && (
						<div className='absolute flex items-center justify-center w-full h-full'>
							<Loader type='spinner' size={28} className='text-white leading-[0]' />
						</div>
					)}
				</Button>
			)}
		</div>
	);
};

export default FormStepNavigation;

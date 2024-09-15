import { FC } from 'react';
import { StepsType, cn } from '#/lib/utils';

type FormProgressProps = {
	steps: StepsType;
	handleStepClick: () => void;
}

const FormProgress: FC<FormProgressProps> = ({ steps, handleStepClick }) => {
	return (
		<nav aria-label='Progress'>
			<ol role='list' className='flex items-center'>
				{steps.map((step, stepIndex) => (
					<li key={stepIndex} className={cn('relative', stepIndex !== steps.length - 1 && 'pr-8 sm:pr-20 flex-1')}>
						{step.status === 'complete' ? (
							<>
								<div className='absolute inset-0 flex items-center' aria-hidden='true'>
									<div className='w-full border border-dashed border-core' />
								</div>
								<button
									type='button'
									onClick={handleStepClick}
									className='relative flex h-6 w-6 items-center justify-center rounded-full bg-core hover:bg-purple-600'
								>
									<span className='text-white text-sm leading-[0]'>{stepIndex + 1}</span>
									<span className='sr-only'>{step.title}</span>
								</button>
							</>
						) : step.status === 'current' ? (
							<>
								<div className='absolute inset-0 flex items-center' aria-hidden='true'>
									<div className='w-full border border-dashed border-gray-300 dark:border-gray-500' />
								</div>
								<button
									type='button'
									onClick={handleStepClick}
									className='relative flex h-6 w-6 items-center justify-center rounded-full border-2 border-core bg-white dark:bg-black'
									aria-current='step'
								>
									<span className='h-2.5 w-2.5 rounded-full bg-core' aria-hidden='true' />
									<span className='sr-only'>{step.title}</span>
								</button>
							</>
						) : (
							<>
								<div className='absolute inset-0 flex items-center' aria-hidden='true'>
									<div className='w-full border border-dashed border-gray-300 dark:border-gray-500' />
								</div>
								<button
									type='button'
									onClick={handleStepClick}
									className='group relative flex h-6 w-6 items-center justify-center rounded-full border-2 border-gray-300 dark:border-gray-500 bg-gray-300 dark:bg-gray-500'
								>
									<span className='text-white text-sm leading-[0]'>{stepIndex + 1}</span>
									<span className='sr-only'>{step.title}</span>
								</button>
							</>
						)}
					</li>
				))}
			</ol>
		</nav>
	)
}

export default FormProgress;

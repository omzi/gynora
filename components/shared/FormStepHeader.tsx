import { FC } from 'react';
import { StepsType } from '#/lib/utils';

type FormStepHeaderProps = {
	step: StepsType[number];
}

const FormStepHeader: FC<FormStepHeaderProps> = ({ step }) => {
	return (
		<>
			<h3 className='text-[32px] leading-none lg:text-3xl font-bold'>{step.title}</h3>
			<h2 className='text-[18px] text-gray-500 -mt-4'>{step.subtitle}</h2>
		</>
	)
}

export default FormStepHeader;

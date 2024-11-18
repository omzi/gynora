'use client';

import * as z from 'zod';
import Link from 'next/link';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage
} from '#/components/ui/form';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '#/components/ui/select';
import Image from 'next/image';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { ImageIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Input } from '#/components/ui/input';
import { Button } from '#/components/ui/button';
import { UserDataSchema } from '#/lib/validations';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import saveUserData from '#/lib/actions/saveUserData';
import background from '#/public/images/background.webp';
import FormProgress from '#/components/shared/FormProgress';
import FormStepHeader from '#/components/shared/FormStepHeader';
import { ChangeEvent, useEffect, useState, useRef, } from 'react';
import FormStepNavigation from '#/components/shared/FormNavigation';
import { DEFAULT_SIGN_IN_REDIRECT, GENDERS, cn, defaultStepsState, isBase64Image, mentalHealthGoals, resizeImage } from '#/lib/utils';

interface OnboardingProps {
	userId: string;
	firstName: string;
};

const Onboarding = ({
	userId,
	firstName
}: OnboardingProps) => {
	const router = useRouter();
	const formTopRef = useRef<HTMLDivElement>(null);
	const [previousStep, setPreviousStep] = useState(0);
	const [currentStep, setCurrentStep] = useState(-1);
	const delta = currentStep - previousStep;
	const [steps, setSteps] = useState(defaultStepsState);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [profilePicturePreview, setProfilePicturePreview] = useState('');

	const form = useForm<z.infer<typeof UserDataSchema>>({
		resolver: zodResolver(UserDataSchema),
		mode: 'all',
		defaultValues: {
			userId,
			profilePicture: '',
			dateOfBirth: '',
			gender: undefined,
			mentalHealthGoals: [],
			toneFocus: 2,
			responseStyle: 3,
			approachType: 1
		}
	});

	const selectedGoals = form.watch('mentalHealthGoals');
	const { register, trigger, setError, setValue, getValues, formState: { errors, dirtyFields, isValid } } = form;

	const scrollToTop = () => {
		// @ts-ignore
		window.trigger = trigger;
		if (formTopRef.current) {
			formTopRef.current.scrollIntoView({ behavior: 'smooth' });
		}
	};

	useEffect(() => {
		let timer: NodeJS.Timeout;
		if (currentStep >= 0) {
			timer = setTimeout(() => {
				scrollToTop();
			}, 500);
		}

		return () => clearTimeout(timer);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentStep]);

	type FieldTypes = z.infer<typeof UserDataSchema>;
	type FieldNames = keyof FieldTypes;

	const handleGetStarted = () => {
		setCurrentStep(0);

		// Set steps to reflect the current progress of the form
		setSteps(previousSteps =>
			previousSteps.map((step, idx) =>
				idx === currentStep + 1
					? { ...step, status: 'current' }
					: step
			)
		);
	};

	const next = async () => {
		const step = steps[currentStep];
		const fields = step.fields as FieldNames[];
		const areFieldsValid = await trigger(fields, { shouldFocus: true });

		if (!areFieldsValid) return;

		if (currentStep < steps.length - 1) {
			setPreviousStep(currentStep);
			setCurrentStep(step => step + 1);

			// Set steps to reflect the current progress of the form
			setSteps(previousSteps =>
				previousSteps.map((step, idx) =>
					idx === currentStep
						? { ...step, status: 'complete' }
						: idx === currentStep + 1
							? { ...step, status: 'current' }
							: step
				)
			);
		}
	};

	const previous = () => {
		if (currentStep > 0) {
			setPreviousStep(currentStep);
			setCurrentStep(step => step - 1);

			// Set steps to reflect the current progress of the form
			setSteps(previousSteps =>
				previousSteps.map((step, index) =>
					index === currentStep
						? { ...step, status: 'upcoming' }
						: index === currentStep - 1
							? { ...step, status: 'current' }
							: step
				)
			);
		}
	};

	const handleSubmit = async () => {
		const isFormValid = await trigger(undefined, { shouldFocus: true });
		if (!isFormValid) return;

		setIsSubmitting(true);

		const data = getValues();
		const hasImageChanged = isBase64Image(data.profilePicture ?? '');
		if (hasImageChanged) {
			// TODO: Upload profile picture...
			const url = '';
		}

		delete data.profilePicture;
		const response = await saveUserData({
			...data,
			dateOfBirth: (new Date(data.dateOfBirth)).toISOString()
		});

		if (response.error) {
			toast.error(response.error);
			setIsSubmitting(false);
		} else {
			toast.success(response.success);
			router.push(DEFAULT_SIGN_IN_REDIRECT);
		}
	};

	const handleProfilePictureUpload = async (e: ChangeEvent<HTMLInputElement>) => {
		e.preventDefault();

		const fileReader = new FileReader();
		if (e.target.files?.length) {
			const [file] = e.target.files;

			// Size validation
			const maxSizeInBytes = 1 * 1024 * 1024; // 1MB
			if (file.size > maxSizeInBytes) {
				setProfilePicturePreview('');
				setValue('profilePicture', '');
				setError('profilePicture', { message: 'Image size exceeds 1MB limit' });
				return;
			}

			if (!['image/jpg', 'image/jpeg', 'image/png'].includes(file.type)) {
				setProfilePicturePreview('');
				setValue('profilePicture', '');
				setError('profilePicture', { message: 'Please select a supported file type' });
				return;
			}

			fileReader.onload = async (event) => {
				const imageDataURL = event.target?.result?.toString() || '';
				// Convert to image/jpeg and resize
				const resizedImageDataUrl = await resizeImage(imageDataURL, 200, 200, 0.8);

				setProfilePicturePreview(resizedImageDataUrl);
				setValue('profilePicture', resizedImageDataUrl, { shouldValidate: true });
			}

			fileReader.readAsDataURL(file);
		}
	};

	return (
		<div className='flex h-svh bg-white dark:bg-black items-center justify-center'>
			{/* Left Pane  */}
			<div className='hidden lg:flex fixed top-0 left-0 w-1/2 h-full'>
				<Image
					src={background}
					alt='Abstract Purple Background'
					width={1920}
					height={1920}
					className='w-full h-full object-cover'
					placeholder='blur'
				/>
			</div>

			{/* Right Pane */}
			<div className='w-full lg:w-1/2 fixed top-0 right-0 h-full overflow-y-auto'>
				<div ref={formTopRef} />
				<Image
					src={background}
					alt='Abstract Purple Background'
					width={1920}
					height={1920}
					className='w-full h-48 md:h-32 object-cover block lg:hidden'
					placeholder='blur'
				/>
				<div className='flex flex-col justify-center w-full max-w-2xl mx-auto gap-y-6 px-4 py-6 lg:py-12 sm:px-6 lg:px-8'>
					<Form {...form}>
						<form className='flex-1 flex flex-col gap-y-6 overflow-x-hidden' action={handleSubmit}>
							{currentStep >= 0 && <FormProgress steps={steps} handleStepClick={() => {}} />}

							{currentStep === -1 && (
								<motion.div
									initial={{ x: delta >= 0 ? '50%' : '-50%', opacity: 0 }}
									animate={{ x: 0, opacity: 1 }}
									transition={{ duration: 0.3, ease: 'easeInOut' }}
									className='flex flex-col gap-y-6'
								>
									<Link href={'/'} className='w-fit'>
										<Image
											src={'/images/logo.png'}
											height={80}
											width={80}
											alt='Gynora Logo'
											fetchPriority='high'
										/>
									</Link>
									<h3 className='text-[32px] leading-none lg:text-5xl font-bold'>
										Welcome To Gynora!
									</h3>
									<h2 className='text-[18px] text-gray-500 -mt-6'>
										Your personalized mental health companion
									</h2>
									<p className='text-[18px] text-black dark:text-white'>
										👋 Hi, {firstName}! I&apos;m here to support your mental well-being with tailored insights, mood tracking, and guided affirmations.
									</p>
									<div className='text-[18px] space-y-2'>
										<p className='text-black dark:text-white font-semibold'>
											What You Can Expect:
										</p>
										<ul className='list-star list-inside'>
											<li className='flex items-start mb-2'>
												<span className='w-2.5 h-full text-core rounded-full inline-block mr-2.5'>✦</span>
												<span><strong>Personalized Therapist:</strong> Receive guidance and advice that feels tailored to you, just like talking to a therapist.</span>
											</li>
											<li className='flex items-start mb-2'>
												<span className='w-2.5 h-full text-core rounded-full inline-block mr-2.5'>✦</span>
												<span><strong>Guided Affirmations:</strong> I’ll generate affirmations that resonate with your unique emotional needs and guide you through them.</span>
											</li>
											<li className='flex items-start mb-2'>
												<span className='w-2.5 h-full text-core rounded-full inline-block mr-2.5'>✦</span>
												<span><strong>Mindfulness Reminders:</strong> Get gentle nudges for mindfulness exercises to help you stay grounded.</span>
											</li>
											<li className='flex items-start mb-2'>
												<span className='w-2.5 h-full text-core rounded-full inline-block mr-2.5'>✦</span>
												<span><strong>Progress Visualization:</strong> Visualize your mental health journey and see your growth over time.</span>
											</li>
										</ul>
									</div>
									<p className='text-[18px] text-black dark:text-white'>
										Let&apos;s get started! I just need a few details to tailor your experience. It only takes a few moments, and it will help me provide you with the best personalized support.
									</p>
									<p className='text-[18px] text-black dark:text-white font-semibold'>
										Ready to begin your mental health journey?
									</p>
									<Button onClick={handleGetStarted} className='h-12 relative bg-black dark:bg-core text-sm xl:text-base'>
										Get Started
									</Button>
								</motion.div>
							)}

							{currentStep === 0 && (
								<motion.div
									initial={{ x: delta >= 0 ? '50%' : '-50%', opacity: 0 }}
									animate={{ x: 0, opacity: 1 }}
									transition={{ duration: 0.3, ease: 'easeInOut' }}
									className='flex flex-col gap-y-6'
								>
									<FormStepHeader step={steps[currentStep]} />

									{/* Profile Picture */}
									<div className='flex flex-col items-center gap-y-3'>
										<div className={cn(
											'w-32 h-32 rounded-lg flex items-center justify-center overflow-hidden border border-gray-400',
											errors.profilePicture && errors.profilePicture.message && '!border-red-400',
											dirtyFields.profilePicture && !errors.profilePicture && '!border-green-400'
										)}>
											{profilePicturePreview ? (
												<Image
													src={profilePicturePreview}
													alt='Profile picture'
													width={128}
													height={128}
													className='w-32 h-32 object-cover'
												/>
											) : (
												<ImageIcon
													width={50}
													height={50}
												/>
											)}
										</div>
										{errors.profilePicture?.message && (
											<p className='-mt-2 text-sm text-red-400'>{errors.profilePicture.message}</p>
										)}
										{dirtyFields.profilePicture && !errors.profilePicture && (
											<p className='-mt-2 text-sm text-green-400'>Profile picture successfully selected</p>
										)}
										<span className='text-gray-500'>(optional)</span>
										<p><span className='font-bold'>Supported Format</span>: <span className='text-core-secondary'>.jpg, .jpeg, .png</span></p>
										<p className='-mt-2'><span className='font-bold'>Maximum File Size</span>: <span className='text-gray-500'>1MB</span></p>
										<label htmlFor='image' className='mt-2 cursor-pointer'>
											<span className={cn(
												'px-4 py-2 text-sm select-none bg-white dark:bg-black border rounded-md text-core border-core ring-0',
												isSubmitting && 'cursor-not-allowed opacity-50'
											)}>
												Choose Profile Picture
											</span>
											<Input
												type='file'
												id='image'
												className='sr-only'
												disabled={isSubmitting}
												accept='.jpg, .jpeg, .png'
												onChange={handleProfilePictureUpload}
											/>
										</label>
									</div>
									
									{/* Date Of Birth */}
									<FormField
										name='dateOfBirth'
										disabled={isSubmitting}
										control={form.control}
										render={({ field }) => (
											<FormItem>
												<FormControl>
													<div className={cn('relative', isSubmitting && 'cursor-not-allowed opacity-50')}>
														<label htmlFor={field.name} className='absolute -top-2.5 left-5 inline-block select-none bg-white dark:bg-black px-1 text-base font-medium text-gray-600 dark:text-gray-300'>
															Date Of Birth <span className='text-red-500'>*</span>
														</label>
														<input
															type='date'
															className={cn(
																'block w-full rounded-md border-0 py-2 px-6 h-14 text-gray-900 dark:text-gray-200 shadow-sm bg-white dark:bg-black ring-1 ring-inset ring-gray-300 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-base',
																errors[field.name]?.message && 'ring-red-400 focus:ring-red-400'
															)}
															placeholder='Select your date of birth'
															disabled={isSubmitting}
															id={field.name}
															{...field}
														/>
													</div>
												</FormControl>
												<FormMessage className='text-red-400' />
											</FormItem>
										)}
									/>
									{/* Gender */}
									<Controller
										name='gender'
										disabled={isSubmitting}
										control={form.control}
										render={({ field }) => (
											<Select disabled={isSubmitting} value={field.value} onValueChange={field.onChange}>
												<div className='space-y-2'>
													<SelectTrigger className={cn(
														'w-full relative bg-transparent text-base py-2 px-6 h-14 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-offset-0 focus:ring-indigo-600',
														errors.gender?.message && 'ring-red-400 focus:ring-red-400'
													)}>
														<label htmlFor={field.name} className='absolute -top-2.5 left-5 inline-block select-none bg-white dark:bg-black px-1 text-base font-medium text-gray-600 dark:text-gray-300'>
															Gender <span className='text-red-500'>*</span>
														</label>
														<SelectValue placeholder='Select a gender' />
													</SelectTrigger>
													{errors.gender?.message && (
														<p className='mt-2 text-sm text-red-400'>{errors.gender.message}</p>
													)}
												</div>
												<SelectContent>
													{GENDERS.map((gender, idx) => (
														<SelectItem key={idx} value={gender.value}>{gender.text}</SelectItem>
													))}
												</SelectContent>
											</Select>
										)}
									/>
									
									<FormStepNavigation
										previous={previous}
										next={next}
										currentStep={currentStep}
										steps={steps}
										isSubmitting={isSubmitting}
										isValid={isValid}
									/>
								</motion.div>
							)}

							{currentStep === 1 && (
								<motion.div
									initial={{ x: delta >= 0 ? '50%' : '-50%', opacity: 0 }}
									animate={{ x: 0, opacity: 1 }}
									transition={{ duration: 0.3, ease: 'easeInOut' }}
									className='flex flex-col gap-y-6'
								>
									<FormStepHeader step={steps[currentStep]} />

									{/* Mental Health Goals */}
									<div className='space-y-1.5'>
										<p className='text-base font-medium leading-6 text-gray-600 dark:text-gray-300'>
											Required <span className='text-red-500'>*</span>
										</p>
										<div className='flex flex-wrap gap-3'>
											{mentalHealthGoals.map((goal, idx) => (
												<Controller
													key={idx}
													name='mentalHealthGoals'
													disabled={isSubmitting}
													control={form.control}
													render={({ field }) => (
														<label
															key={idx}
															htmlFor={`goal-${idx}`}
															className={cn(
																'inline-flex flex-row xs:flex-col items-center xs:items-start justify-between select-none w-fit py-2 px-4 gap-x-2 gap-y-1 text-gray-500 bg-gray-500/10 border-2 border-gray-500 rounded-full cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-500/50',
																selectedGoals.includes(goal) && 'has-[:checked]:!border-core has-[:checked]:!text-core has-[:checked]:!bg-core/15',
																isSubmitting && 'cursor-not-allowed opacity-50'
															)}>
															<input
																type='checkbox'
																id={`goal-${idx}`}
																value={goal}
																className='sr-only'
																disabled={isSubmitting}
																checked={selectedGoals.includes(goal)}
																onChange={e => {
																	const newValue = e.target.checked
																		? [...field.value, e.target.value]
																		: field.value.filter(value => value !== e.target.value);
																	
																	field.onChange(newValue);
																	trigger('mentalHealthGoals');
																}}
															/>
															<div className='w-full text-base font-medium'>{goal}</div>
														</label>
													)}
												/>
											))}
										</div>
										{errors.mentalHealthGoals?.message && (
											<p className='mt-2 text-sm text-red-400'>{errors.mentalHealthGoals.message}</p>
										)}
									</div>
									
									<FormStepNavigation
										previous={previous}
										next={next}
										currentStep={currentStep}
										steps={steps}
										isSubmitting={isSubmitting}
										isValid={isValid}
									/>
								</motion.div>
							)}

							{currentStep === 2 && (
								<motion.div
									initial={{ x: delta >= 0 ? '50%' : '-50%', opacity: 0 }}
									animate={{ x: 0, opacity: 1 }}
									transition={{ duration: 0.3, ease: 'easeInOut' }}
									className='flex flex-col gap-y-6'
								>
									<FormStepHeader step={steps[currentStep]} />

									{/* Tone Focus */}
									<div className='space-y-1.5'>
										<p className='text-base font-medium leading-6 text-gray-600 dark:text-gray-300'>
											Tone Focus <span className='text-red-500'>*</span>
										</p>
										<Controller
											disabled={isSubmitting}
											name='toneFocus'
											control={form.control}
											render={({ field }) => (
												<div className='w-full'>
													<div className='flex justify-between mb-2'>
														<span className='text-sm text-muted-foreground'>Empathy</span>
														<span className='text-sm text-muted-foreground'>Understanding</span>
													</div>
													<input
														type='range'
														min='0'
														max='5'
														value={field.value}
														className={cn('range', isSubmitting && 'cursor-not-allowed opacity-50')}
														onChange={e => {
															const newValue = parseInt(e.target.value, 10);

															field.onChange(newValue);
														}}
													/>

													<div className='flex w-full justify-between px-2'>
														{Array.from({ length: 6 }, (_, idx) => (
															<div key={idx} className='w-0.5 h-1.5 bg-gray-600' />
														))}
													</div>
												</div>
											)}
										/>
										{errors.toneFocus?.message && (
											<p className='mt-2 text-sm text-red-400'>{errors.toneFocus.message}</p>
										)}
									</div>

									{/* Response Style */}
									<div className='space-y-1.5'>
										<p className='text-base font-medium leading-6 text-gray-600 dark:text-gray-300'>
											Response Style <span className='text-red-500'>*</span>
										</p>
										<Controller
											disabled={isSubmitting}
											name='responseStyle'
											control={form.control}
											render={({ field }) => (
												<div className='w-full'>
													<div className='flex justify-between mb-2'>
														<span className='text-sm text-muted-foreground'>Listening</span>
														<span className='text-sm text-muted-foreground'>Solutioning</span>
													</div>
													<input
														type='range'
														min='0'
														max='5'
														value={field.value}
														className={cn('range', isSubmitting && 'cursor-not-allowed opacity-50')}
														onChange={e => {
															const newValue = parseInt(e.target.value, 10);

															field.onChange(newValue);
														}}
													/>

													<div className='flex w-full justify-between px-2'>
														{Array.from({ length: 6 }, (_, idx) => (
															<div key={idx} className='w-0.5 h-1.5 bg-gray-600' />
														))}
													</div>
												</div>
											)}
										/>
										{errors.responseStyle?.message && (
											<p className='mt-2 text-sm text-red-400'>{errors.responseStyle.message}</p>
										)}
									</div>

									{/* Approach Type */}
									<div className='space-y-1.5'>
										<p className='text-base font-medium leading-6 text-gray-600 dark:text-gray-300'>
											Approach Type <span className='text-red-500'>*</span>
										</p>
										<Controller
											disabled={isSubmitting}
											name='approachType'
											control={form.control}
											render={({ field }) => (
												<div className='w-full'>
													<div className='flex justify-between mb-2'>
														<span className='text-sm text-muted-foreground'>Holistic</span>
														<span className='text-sm text-muted-foreground'>Targeted</span>
													</div>
													<input
														type='range'
														min='0'
														max='5'
														value={field.value}
														className={cn('range', isSubmitting && 'cursor-not-allowed opacity-50')}
														onChange={e => {
															const newValue = parseInt(e.target.value, 10);
	
															field.onChange(newValue);
														}}
													/>
													
													<div className='flex w-full justify-between px-2'>
														{Array.from({ length: 6 }, (_, idx) => (
															<div key={idx} className='w-0.5 h-1.5 bg-gray-600' />
														))}
													</div>
												</div>
											)}
										/>
										{errors.approachType?.message && (
											<p className='mt-2 text-sm text-red-400'>{errors.approachType.message}</p>
										)}
									</div>
									
									<FormStepNavigation
										previous={previous}
										next={next}
										currentStep={currentStep}
										steps={steps}
										isSubmitting={isSubmitting}
										isValid={isValid}
									/>
								</motion.div>
							)}

							{/* TODO: Do a final page for congratulating the user... */}
						</form>
					</Form>
				</div>
			</div>
		</div>
	);
}

export default Onboarding;

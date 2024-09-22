'use client';

import * as z from 'zod';
import Image from 'next/image';
import { toast } from 'react-toastify';
import { ImageIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Input } from '#/components/ui/input';
import { useEdgeStore } from '#/lib/edgestore';
import { Button } from '#/components/ui/button';
import { UserDataSchema } from '#/lib/validations';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { saveProfile } from '#/lib/actions/mutations';
import { useUser, useUserData } from '#/components/contexts/UserContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormMessage } from '#/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '#/components/ui/select';
import { GENDERS, mentalHealthGoals, cn, isBase64Image, compressImage, dataURIToFile } from '#/lib/utils';

const Profile = () => {
	const user = useUser();
	const userData = useUserData();
	const { edgestore } = useEdgeStore();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [profileTab, setProfileTab] = useState<'personal' | 'settings'>('personal');
	const [profilePicturePreview, setProfilePicturePreview] = useState(user.image);
	const [isPersonalChanged, setIsPersonalChanged] = useState(false);
	const [isSettingsChanged, setIsSettingsChanged] = useState(false);

	const form = useForm<z.infer<typeof UserDataSchema>>({
		resolver: zodResolver(UserDataSchema),
		mode: 'all',
		defaultValues: {
			userId: user.id,
			profilePicture: user.image ?? '',
			dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth).toISOString().split('T')[0] : '',
			gender: userData.gender,
			mentalHealthGoals: userData.mentalHealthGoals,
			toneFocus: userData.toneFocus,
			responseStyle: userData.responseStyle,
			approachType: userData.approachType
		}
	});

	const { register, control, setValue, watch, getValues, formState: { errors, dirtyFields, isValid } } = form;

	const selectedGoals = watch('mentalHealthGoals') || [];
	const personalFields = watch(['profilePicture', 'dateOfBirth', 'gender']);
	const settingsFields = watch(['mentalHealthGoals', 'toneFocus', 'responseStyle', 'approachType']);

	useEffect(() => {
		const personalFieldsChanged = Object.keys(dirtyFields).some(field => ['profilePicture', 'dateOfBirth', 'gender'].includes(field));
		setIsPersonalChanged(personalFieldsChanged);
	}, [personalFields, dirtyFields]);

	useEffect(() => {
		setIsSettingsChanged(Object.keys(dirtyFields).some(field => ['mentalHealthGoals', 'toneFocus', 'responseStyle', 'approachType'].includes(field)));
	}, [settingsFields, dirtyFields]);

	const onProfileTabChange = (value: string) => {
		if (isSubmitting) return;
		
		setProfileTab(value as 'personal' | 'settings');
	};

	const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		e.preventDefault();

		const fileReader = new FileReader();
		if (e.target.files?.length) {
			const [file] = e.target.files;
			form.clearErrors('profilePicture');

			const maxSizeInBytes = 1 * 1024 * 1024; // 1MB
			if (file.size > maxSizeInBytes) {
				form.setError('profilePicture', { message: 'Image size exceeds 1MB limit' });
				return;
			}

			if (!['image/jpg', 'image/jpeg', 'image/png'].includes(file.type)) {
				form.setError('profilePicture', { message: 'Please select a supported file type' });
				return;
			}

			fileReader.onload = async (event) => {
				const imageDataURL = event.target?.result?.toString() || '';
				const resizedImageDataURL = await compressImage(imageDataURL, 0.7, 0.5);

				setProfilePicturePreview(resizedImageDataURL);
				setValue('profilePicture', resizedImageDataURL, { shouldValidate: true });
			}

			fileReader.readAsDataURL(file);
		}
	};

	const handleSubmit = async (data: z.infer<typeof UserDataSchema>) => {
		setIsSubmitting(true);
		
		try {
			const hasImageChanged = isBase64Image(data.profilePicture ?? '');
			if (hasImageChanged) {
				const result = await edgestore.profilePictures.upload({
					file: dataURIToFile(data.profilePicture ?? '', user.id)
				});

				data.profilePicture = result.url;

				if (user.image && user.image.startsWith('https://files.edgestore.dev')) {
					await edgestore.profilePictures.delete({ url: user.image });
				}
			}

			const response = await saveProfile({
				...data,
				dateOfBirth: (new Date(data.dateOfBirth)).toISOString()
			}, hasImageChanged);
			if (response.error) {
				toast.error(response.error);
			} else {
				toast.success(response.success);
			}

			if (profileTab === 'personal') {
				setIsPersonalChanged(false);
			} else {
				setIsSettingsChanged(false);
			}
		} catch (error) {
			console.error('Error saving profile :>>', error);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className='flex flex-col h-full'>
			<div className='space-y-2 my-2'>
				<h1 className='text-3xl sm:text-4xl font-semibold text-black dark:text-white'>
					Your Profile
				</h1>
				<Tabs value={profileTab} onValueChange={onProfileTabChange} className='w-full py-4'>
					<TabsList className='grid w-full xs:max-w-lg grid-cols-2'>
						<TabsTrigger disabled={isSubmitting} value='personal'>Personal</TabsTrigger>
						<TabsTrigger disabled={isSubmitting} value='settings'>Settings</TabsTrigger>
					</TabsList>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
							<TabsContent value='personal' className='mt-6 space-y-8'>
								<div className='flex flex-col items-center gap-y-3 w-fit'>
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

								<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
									<FormField
										name='dateOfBirth'
										disabled={isSubmitting}
										control={control}
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
									<Controller
										name='gender'
										disabled={isSubmitting}
										control={control}
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
												<SelectContent className='select-content-width-full'>
													{GENDERS.map((gender, idx) => (
														<SelectItem className='py-2 cursor-pointer' key={idx} value={gender.value}>{gender.text}</SelectItem>
													))}
												</SelectContent>
											</Select>
										)}
									/>
								</div>

								<Button
									type='submit'
									disabled={isSubmitting || !isPersonalChanged}
									className='w-full'
								>
									{isSubmitting ? 'Saving...' : 'Save Personal Information'}
								</Button>
							</TabsContent>
							<TabsContent value='settings' className='mt-6 space-y-6'>
								{/* Mental Health Goals */}
								<div className='space-y-1.5'>
									<p className='text-base font-medium leading-6 text-gray-600 dark:text-gray-300'>
										Mental Health Goals <span className='text-red-500'>*</span>
									</p>
									<div className='flex flex-wrap gap-3'>
										{mentalHealthGoals.map((goal, idx) => (
											<Controller
												key={idx}
												name='mentalHealthGoals'
												disabled={isSubmitting}
												control={control}
												render={({ field }) => (
													<label
														key={idx}
														htmlFor={`goal-${idx}`}
														className={cn(
															'inline-flex flex-row xs:flex-col items-center xs:items-start justify-between select-none w-fit py-1.5 px-3 gap-x-2 gap-y-1 text-gray-500 bg-gray-500/10 border-2 border-gray-500 rounded-full cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-500/50',
															(field.value || []).includes(goal) && 'has-[:checked]:!border-core has-[:checked]:!text-core has-[:checked]:!bg-core/15',
															isSubmitting && 'cursor-not-allowed opacity-50'
														)}>
														<input
															type='checkbox'
															id={`goal-${idx}`}
															value={goal}
															className='sr-only'
															disabled={isSubmitting}
															checked={(field.value || []).includes(goal)}
															onChange={e => {
																const newValue = e.target.checked
																	? [...field.value, e.target.value]
																	: field.value.filter(value => value !== e.target.value);

																field.onChange(newValue);
																form.trigger('mentalHealthGoals');
															}}
														/>
														<div className='w-full text-sm font-medium'>{goal}</div>
													</label>
												)}
											/>
										))}
									</div>
									{errors.mentalHealthGoals?.message && (
										<p className='mt-2 text-sm text-red-400'>{errors.mentalHealthGoals.message}</p>
									)}
								</div>

								{/* Tone Focus */}
								<div className='space-y-1.5'>
									<p className='text-base font-medium leading-6 text-gray-600 dark:text-gray-300'>
										Tone Focus <span className='text-red-500'>*</span>
									</p>
									<Controller
										disabled={isSubmitting}
										name='toneFocus'
										control={control}
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
										control={control}
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
										control={control}
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

								<Button
									type='submit'
									disabled={isSubmitting || !isSettingsChanged}
									className='w-full'
								>
									{isSubmitting ? 'Saving...' : 'Save Settings'}
								</Button>
							</TabsContent>
						</form>
					</Form>
				</Tabs>
			</div>
		</div>
	);
}

export default Profile;

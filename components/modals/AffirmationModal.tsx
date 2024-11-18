'use client';

import * as z from 'zod';
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
import { Voice } from '#/types';
import Loader from 'react-ts-loaders';
import { toast } from 'react-toastify';
import { Prisma } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { Label } from '#/components/ui/label';
import { Input } from '#/components/ui/input';
import { Button } from '#/components/ui/button';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { AffirmationSchema } from '#/lib/validations';
import usePreviousValue from '#/hooks/usePreviousValue';
import { useState, useEffect, useRef, MouseEvent } from 'react';
import { useAffirmationModal } from '#/hooks/useAffirmationModal';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader } from '#/components/ui/dialog';
import { CATEGORIES, cn, COMPLEXITY, TIMEFRAME, TONES, voices } from '#/lib/utils';
import { ChevronDownIcon, ChevronRight, MicIcon, PauseIcon, PlayIcon, ZapIcon } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '#/components/ui/dropdown-menu';

const AffirmationModal = () => {
	const router = useRouter();
	const queryClient = useQueryClient();
	const affirmationModal = useAffirmationModal();
	const voiceRef = useRef<HTMLAudioElement | null>(null);
	const [isVoiceSelectOpen, setIsVoiceSelectOpen] = useState(false);
	const [playingVoice, setPlayingVoice] = useState<Voice | null>(null);
	const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
	const previousVoice = usePreviousValue(selectedVoice);
	const [fetchedVoices, setFetchedVoices] = useState<Map<string, string>>(new Map());

	const form = useForm<z.infer<typeof AffirmationSchema>>({
		resolver: zodResolver(AffirmationSchema),
		mode: 'onChange',
		defaultValues: {
			category: '',
			voice: 'echo',
			culturalBackground: '',
			tone: 'MOTIVATING',
			sentenceCount: 8,
			sentenceComplexity: 'SIMPLE',
			timeframe: 'PRESENT_FOCUSED'
		}
	});

	const { reset, trigger, setValue, formState: { errors } } = form;

	const { mutate: createAffirmationMutation, isPending: createAffirmationLoading } = useMutation({
		mutationFn: async (data: z.infer<typeof AffirmationSchema>) => {
			try {
				const response = await fetch('/api/createAffirmation', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(data)
				});

				if (!response.ok) {
					throw new Error('Failed to create affirmation');
				}

				const { data: affirmation } = await response.json() as { message: string; data: Prisma.AffirmationGetPayload<{}> };
				
				return affirmation;
			} catch (error) {
				throw error;
			}
		},
		onError: (error) => {
			console.log('createAffirmation Error :>>', error);
			toast.error('Failed to create affirmation ;(');
			affirmationModal.onClose();
		},
		onSuccess: (data) => {
			toast.success('Affirmation created!');
			affirmationModal.onClose();
			reset();

			queryClient.invalidateQueries({ queryKey: ['affirmations'] });

			router.push(`/affirmations/${data.id}`);
		}
	});

	const onSubmit = async (formData: z.infer<typeof AffirmationSchema>) => {
		const isFormValid = await trigger(undefined, { shouldFocus: true });
		if (!isFormValid) return;

		console.log('Affirmation Data :>>', formData);
		createAffirmationMutation(formData);
	};

	const onOpenChange = (open: boolean) => {
		if (createAffirmationLoading) return;

		affirmationModal.onClose();
	};

	const handleVoiceSelect = (voice: Voice) => {
		if (previousVoice !== voice) {
			setSelectedVoice(voice);
			setValue('voice', voice);
		}

		setIsVoiceSelectOpen(false);
	};

	const onVoiceSelectOpenChange = (open: boolean) => {
		setIsVoiceSelectOpen(open);
	};

	const handleVoicePreviewClick = (e: MouseEvent<HTMLButtonElement>, voice: Voice) => {
		e.preventDefault();

		const fetchedVoiceUrl = fetchedVoices.get(voice);
		if (fetchedVoiceUrl) {
			if (voiceRef.current) {
				if (playingVoice === voice) {
					voiceRef.current.pause();
					setPlayingVoice(null);
				} else {
					if (playingVoice) {
						voiceRef.current.pause();
					}
					voiceRef.current.src = fetchedVoiceUrl;
					voiceRef.current.play();
					setPlayingVoice(voice);
				}
			}
		}
	};


	useEffect(() => {
		const handleAudioEnded = () => {
			setPlayingVoice(null);
		};

		const currentVoiceRef = voiceRef.current;
		if (currentVoiceRef) {
			currentVoiceRef.addEventListener('ended', handleAudioEnded);
		}

		return () => {
			if (currentVoiceRef) {
				currentVoiceRef.removeEventListener('ended', handleAudioEnded);
			}
		};
	}, []);

	useEffect(() => {
		const fetchVoices = async () => {
			const newFetchedVoices = new Map<string, string>();
			for (const voice of voices) {
				const response = await fetch(voice.src);
				const blob = await response.blob();
				const url = URL.createObjectURL(blob);
				newFetchedVoices.set(voice.id, url);
			}

			setFetchedVoices(newFetchedVoices);
		};

		fetchVoices();
	}, []);

	return (
		<Dialog open={affirmationModal.isOpen} onOpenChange={onOpenChange}>
			<DialogContent showCloseButton={false} className='rounded-lg w-[calc(100%-20px)] sm:w-[24rem] md:w-[30rem]'>
				<DialogHeader className='items-center'>
					<ZapIcon className='w-16 h-16 p-4 text-white rounded-full bg-core' />
					<h2 className='text-lg font-bold'>New Affirmation</h2>
				</DialogHeader>

				<Form {...form}>
					<form id='affirmation' autoFocus={false} onSubmit={form.handleSubmit(onSubmit)} className='max-h-[50vh] grid gap-3 overflow-y-auto scrollbar-thin space-y-2 py-4 pr-2'>
						{/* Category */}
						<Controller
							name='category'
							control={form.control}
							render={({ field }) => (
								<Select disabled={createAffirmationLoading} value={field.value} onValueChange={field.onChange}>
									<div className='space-y-2'>
										<SelectTrigger className={cn(
											'w-full relative bg-transparent text-base text-left py-2 px-6 h-14 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-offset-0 focus:ring-indigo-600',
											errors.category?.message && 'ring-red-400 focus:ring-red-400'
										)}>
											<label htmlFor={field.name} className='absolute -top-2.5 left-5 inline-block select-none bg-background px-1 text-base font-medium text-gray-600 dark:text-gray-300'>
												Category <span className='text-red-500'>*</span>
											</label>
											<SelectValue placeholder='Select a category' />
										</SelectTrigger>
										{errors.category?.message && (
											<p className='mt-2 text-sm text-red-400'>{errors.category.message}</p>
										)}
									</div>
									<SelectContent className='select-content-width-full'>
										{CATEGORIES.map((category, idx) => (
											<SelectItem key={idx} value={category}>
												{category}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							)}
						/>

						{/* Tone */}
						<Controller
							name='tone'
							disabled={createAffirmationLoading}
							control={form.control}
							render={({ field }) => (
								<Select disabled={createAffirmationLoading} value={field.value} onValueChange={field.onChange}>
									<div className='space-y-2'>
										<SelectTrigger className={cn(
											'w-full relative bg-transparent text-base py-2 px-6 h-14 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-offset-0 focus:ring-indigo-600',
											errors.tone?.message && 'ring-red-400 focus:ring-red-400'
										)}>
											<label htmlFor={field.name} className='absolute -top-2.5 left-5 inline-block select-none bg-background px-1 text-base font-medium text-gray-600 dark:text-gray-300'>
												Tone <span className='text-red-500'>*</span>
											</label>
											<SelectValue placeholder='Select a tone' />
										</SelectTrigger>
										{errors.tone?.message && (
											<p className='mt-2 text-sm text-red-400'>{errors.tone.message}</p>
										)}
									</div>
									<SelectContent className='select-content-width-full'>
										{TONES.map((tone, idx) => (
											<SelectItem key={idx} value={tone.value}>{tone.text}</SelectItem>
										))}
									</SelectContent>
								</Select>
							)}
						/>

						<div className='space-y-2 !-mt-1'>
							<Label htmlFor='voice' className='text-base'>Voice</Label>
							<audio ref={voiceRef} className='sr-only' />
							<DropdownMenu open={isVoiceSelectOpen} onOpenChange={onVoiceSelectOpenChange}>
								<DropdownMenuTrigger disabled={fetchedVoices.size !== voices.length || createAffirmationLoading} asChild>
									<Button id='voice' variant='outline' className='w-full relative bg-transparent text-base py-2 px-5 h-14 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-offset-0 focus:ring-indigo-600 flex items-center justify-between [&[data-state=open]>svg]:rotate-180'>
										<div className='flex items-center gap-y-1'>
											<MicIcon className='w-5 h-5 mr-2' />
											<span>{voices.find($ => $.id === selectedVoice)?.text || 'Select Voice'}</span>
										</div>
										<ChevronDownIcon className='w-4 h-4 shrink-0 transition-transform duration-200' />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align='start' className='w-48 p-2'>
									<div className='grid gap-1'>
										{voices.map(voice => (
											<DropdownMenuItem
												key={voice.id}
												onSelect={() => handleVoiceSelect(voice.id)}
												className={cn(
													'flex items-center justify-between cursor-pointer rounded-md',
													selectedVoice === voice.id && 'bg-accent text-accent-foreground'
												)}
											>
												<div className='font-medium'>{voice.text}</div>
												<Button onClick={e => handleVoicePreviewClick(e, voice.id)} size='icon' className='rounded-full w-8 h-8'>
													{playingVoice === voice.id ? <PauseIcon className='w-4 h-4' /> : <PlayIcon className='w-4 h-4' />}
												</Button>
											</DropdownMenuItem>
										))}
									</div>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
						
						{/* Cultural Background */}
						<FormField
							name='culturalBackground'
							disabled={createAffirmationLoading}
							control={form.control}
							render={({ field }) => (
								<FormItem className='!-mt-1'>
									<FormControl>
										<div className={cn('space-y-2', createAffirmationLoading && 'cursor-not-allowed opacity-50')}>
											<Label className='text-base' htmlFor={field.name}>Cultural Background <span className='text-muted-foreground italic'>(optional)</span></Label>
											<Input id={field.name} type='text' placeholder='Enter your cultural affiliation' {...field} className='py-2 px-6 h-14 text-base ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-offset-0 focus:ring-indigo-600' />
										</div>
									</FormControl>
									<FormMessage className='text-red-400' />
								</FormItem>
							)}
						/>

						{/* Sentence Complexity */}
						<Controller
							name='sentenceComplexity'
							disabled={createAffirmationLoading}
							control={form.control}
							render={({ field }) => (
								<Select disabled={createAffirmationLoading} value={field.value} onValueChange={field.onChange}>
									<div className='space-y-2'>
										<SelectTrigger className={cn(
											'w-full relative bg-transparent text-base py-2 px-6 h-14 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-offset-0 focus:ring-indigo-600',
											errors.sentenceComplexity?.message && 'ring-red-400 focus:ring-red-400'
										)}>
											<label htmlFor={field.name} className='absolute -top-2.5 left-5 inline-block select-none bg-background px-1 text-base font-medium text-gray-600 dark:text-gray-300'>
												Sentence Complexity <span className='text-red-500'>*</span>
											</label>
											<SelectValue placeholder='Select a sentence complexity level' />
										</SelectTrigger>
										{errors.sentenceComplexity?.message && (
											<p className='mt-2 text-sm text-red-400'>{errors.sentenceComplexity.message}</p>
										)}
									</div>
									<SelectContent className='select-content-width-full'>
										{COMPLEXITY.map((tone, idx) => (
											<SelectItem key={idx} value={tone.value}>{tone.text}</SelectItem>
										))}
									</SelectContent>
								</Select>
							)}
						/>

						{/* Sentence Count */}
						<div className='space-y-1.5'>
							<p className='text-base font-medium leading-6 text-gray-600 dark:text-gray-300'>
								Sentence Count <span className='text-red-500'>*</span>
							</p>
							<Controller
								disabled={createAffirmationLoading}
								name='sentenceCount'
								control={form.control}
								render={({ field }) => (
									<div className='w-full'>
										<div className='flex justify-between mb-2'>
											<span className='text-sm text-muted-foreground'>Short</span>
											<span className='text-sm text-muted-foreground'>Medium</span>
											<span className='text-sm text-muted-foreground'>Long</span>
										</div>
										<input
											type='range'
											min='8'
											step='8'
											max='24'
											value={field.value}
											className={cn('range', createAffirmationLoading && 'cursor-not-allowed opacity-50')}
											onChange={e => {
												const newValue = parseInt(e.target.value, 10);

												field.onChange(newValue);
											}}
										/>

										<div className='flex w-full justify-between px-2'>
											{Array.from({ length: 3 }, (_, idx) => (
												<div key={idx} className='w-0.5 h-1.5 bg-gray-600' />
											))}
										</div>
									</div>
								)}
							/>
							{errors.sentenceCount?.message && (
								<p className='mt-2 text-sm text-red-400'>{errors.sentenceCount.message}</p>
							)}
						</div>

						{/* Timeframe */}
						<Controller
							name='timeframe'
							disabled={createAffirmationLoading}
							control={form.control}
							render={({ field }) => (
								<Select disabled={createAffirmationLoading} value={field.value} onValueChange={field.onChange}>
									<div className='space-y-2'>
										<SelectTrigger className={cn(
											'w-full relative bg-transparent text-base py-2 px-6 h-14 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-offset-0 focus:ring-indigo-600',
											errors.timeframe?.message && 'ring-red-400 focus:ring-red-400'
										)}>
											<label htmlFor={field.name} className='absolute -top-2.5 left-5 inline-block select-none bg-background px-1 text-base font-medium text-gray-600 dark:text-gray-300'>
												Timeframe <span className='text-red-500'>*</span>
											</label>
											<SelectValue placeholder='Select a timeframe' />
										</SelectTrigger>
										{errors.timeframe?.message && (
											<p className='mt-2 text-sm text-red-400'>{errors.timeframe.message}</p>
										)}
									</div>
									<SelectContent className='select-content-width-full'>
										{TIMEFRAME.map((timeframe, idx) => (
											<SelectItem key={idx} value={timeframe.value}>{timeframe.text}</SelectItem>
										))}
									</SelectContent>
								</Select>
							)}
						/>
					</form>

					<div className='flex flex-row items-center justify-between gap-x-4'>
						<Button variant='secondary' onClick={affirmationModal.onClose}>
							Close
						</Button>

						<Button disabled={createAffirmationLoading} type='submit' form='affirmation' className='bg-core hover:bg-core-600'>
							<span className={cn('opacity-100 flex items-center', createAffirmationLoading && 'opacity-0')}>
								Create Affirmation
								<ChevronRight className='ml-2 w-5 h-5' />
							</span>
							{createAffirmationLoading && (
								<div className='absolute flex items-center justify-center w-full h-full'>
									<Loader type='spinner' size={28} className='text-white leading-[0]' />
								</div>
							)}
						</Button>
					</div>
				</Form>
			</DialogContent>
		</Dialog>
	);
};

export default AffirmationModal;

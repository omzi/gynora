/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import Image from 'next/image';
import Loader from 'react-ts-loaders';
import { toast } from 'react-toastify';
import { useMediaQuery } from 'usehooks-ts';
import { useRouter } from 'next/navigation';
import { Button } from '#/components/ui/button';
import PromptItem from '#/components/PromptItem';
import { cn, prompts, shuffleArray } from '#/lib/utils';
import ExpandableTextArea from '#/components/ExpandableTextArea';
import { ArrowUpIcon, HelpCircleIcon, MicIcon } from 'lucide-react';
import { MouseEvent, useEffect, useMemo, useRef, useState } from 'react';
import AudioRecordingModal from '#/components/modals/AudioRecordingModal';

const Chat = () => {
	const router = useRouter();
	const [input, setInput] = useState('');
	const messageBoxRef = useRef<HTMLDivElement>(null);
	const isMobile = useMediaQuery('(max-width: 768px)');
	const [isRecording, setIsRecording] = useState(false);
	const submitButtonRef = useRef<HTMLButtonElement>(null);
	const [isCreatingChat, setIsCreatingChat] = useState(false);
	const [messageBoxHeight, setMessageBoxHeight] = useState(0);
	const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);
	const [selectedPrompts, setSelectedPrompts] = useState<typeof prompts>();

	const numberOfPrompts = isMobile ? 2 : 4;
	const shuffledPrompts = useMemo(() => shuffleArray(prompts), []);

	useEffect(() => {
		const selectedPrompts = shuffledPrompts.slice(0, numberOfPrompts);
		setSelectedPrompts(selectedPrompts);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [numberOfPrompts]);

	useEffect(() => {
		const observeHeightChanges = () => {
			const observer = new ResizeObserver(entries => {
				for (const entry of entries) {
					if (entry.target === messageBoxRef.current) {
						setMessageBoxHeight(entry.contentRect.height);
					}
				}
			});

			if (messageBoxRef.current) {
				observer.observe(messageBoxRef.current);
			}

			return () => {
				observer.disconnect();
			};
		};

		observeHeightChanges();
	}, []);

	const handlePromptClick = async (prompt: string) => {
		await setInput(prompt);

		if (submitButtonRef.current) {
			submitButtonRef.current.click();
		}
	};

	const handleSubmitButtonClick = (e: MouseEvent<HTMLButtonElement>) => {
		const trimmedValue = input.replace(/^[\s\n]+|[\s\n]+$/g, '');

		// Check if the trimmed value is empty
		trimmedValue.length === 0 && e.preventDefault();
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (isCreatingChat || input.trim().length === 0) return;

		const message = input;
		setIsCreatingChat(true);
		setInput('');

		try {
			const response = await fetch('/api/chats', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ message })
			});

			if (!response.ok) {
				throw new Error('Failed to create chat');
			}

			const { chatId } = await response.json();
			router.push(`/chat/${chatId}`);
		} catch (error) {
			console.error('Error creating chat :>>', error);
			toast.error('Failed to create chat. Please try again.');

			setIsCreatingChat(false);
		}
	};

	const handleAudioRecordingComplete = (transcription: string) => {
		setInput(transcription);
		if (submitButtonRef.current) {
			submitButtonRef.current.click();
		}
	};

	return (
		<div className='flex flex-col h-full relative -m-4 md:-mx-8'>
			<div
				className='flex-1 flex flex-col w-full overflow-y-auto scroll-smooth transition-all duration-300 pb-6 px-2 sm:px-12 scrollbar-thin'
				style={messageBoxHeight > 0 ? { marginBottom: messageBoxHeight - 24 } : {}}
			>
				<div className='flex flex-col justify-center mt-8 text-center'>
					<div className='p-2 border mx-auto rounded-full'>
						<Image
							src={'/images/logo.png'}
							width={32}
							height={32}
							alt={`Bot's avatar`}
							fetchPriority='high'
							className='rounded-full'
						/>
					</div>
					<p className='mt-4 text-xl font-bold'>How can I help you today?</p>
				</div>
				<div className='flex-1' />
				<div className='flex w-full gap-2'>
					<div className='grid w-full grid-cols-1 gap-2 md:grid-cols-2'>
						{selectedPrompts && selectedPrompts.map((prompt, idx) => (
							<PromptItem key={idx} {...prompt} disabled={isCreatingChat} onClick={handlePromptClick} />
						))}
					</div>
				</div>
			</div>

			<div ref={messageBoxRef} className='absolute -bottom-8 left-0 right-0 bg-primary/5 dark:bg-black p-2 flex flex-col z-10 overflow-x-hidden'>
				{/* TODO: Add drawer for audio input... */}

				<form
					onSubmit={handleSubmit}
					className='relative flex flex-col mx-0 sm:mx-12 sm:mt-1 bg-transparent border border-primary/25 rounded-2xl'>
					<ExpandableTextArea
						disabled={isCreatingChat}
						placeholder='Send a message…'
						autoComplete='off'
						value={input}
						onChange={e => setInput(e.target.value)}
						className='m-0 w-full max-h-40 resize-none outline-none transition-all border-0 bg-transparent py-3 md:py-3.5 px-10 md:px-12 focus:ring-0 focus-visible:ring-0 placeholder-primary/50 scrollbar-thin'
					/>

					<div className='absolute flex bottom-6 md:bottom-[1.75rem] translate-y-1/2 left-2 md:left-3'>
						{isRecording ? (
							<Loader type='spinner' size={28} className='leading-[0]' />
						) : (
							<button
								disabled={isCreatingChat}
								onClick={() => setIsAudioModalOpen(true)}
								className={cn(
									'text-white dark:text-black cursor-pointer p-0.5 border border-black rounded-lg dark:border-white bg-black dark:bg-white',
									isCreatingChat && 'opacity-50 pointer-events-none grayscale'
								)}
							>
								<MicIcon className='w-5 h-5' />
							</button>
						)}
					</div>

					<div className='absolute flex bottom-6 md:bottom-[1.75rem] translate-y-1/2 right-2 md:right-3'>
						{isCreatingChat ? (
							<Loader type='spinner' size={28} className='leading-[0]' />
						) : (
							<button
								disabled={isCreatingChat || input.trim().length === 0}
								type='submit'
								onClick={handleSubmitButtonClick}
								ref={submitButtonRef}
								className='text-white dark:text-black hover:text-black dark:hover:text-white hover:bg-white/20 dark:hover:bg-black/20 p-0.5 border border-black rounded-lg dark:border-white bg-black dark:bg-white transition-colors disabled:opacity-50 disabled:pointer-events-none disabled:grayscale'
							>
								<ArrowUpIcon className='w-5 h-5' />
							</button>
						)}
					</div>
				</form>

				<div className='mx-auto mt-2'>
					<Button className='h-auto px-2 py-1 text-xs' variant='outline' size='sm'>
						<HelpCircleIcon className='w-3 h-3 mr-2' />
						Help
					</Button>
				</div>
			</div>

			<AudioRecordingModal
				isOpen={isAudioModalOpen}
				onClose={() => setIsAudioModalOpen(false)}
				onTranscriptionComplete={handleAudioRecordingComplete}
			/>
		</div>
	);
}

export default Chat;

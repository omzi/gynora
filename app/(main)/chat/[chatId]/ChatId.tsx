/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import { cn } from '#/lib/utils';
import { type Message } from 'ai';
import Loader from 'react-ts-loaders';
import { toast } from 'react-toastify';
import { useChat } from '@ai-sdk/react';
import { Button } from '#/components/ui/button';
import { ChatMessage } from '#/components/ChatMessage';
import { useQueryClient } from '@tanstack/react-query';
import { useScrollAnchor } from '#/hooks/useScrollAnchor';
import { useUser } from '#/components/contexts/UserContext';
import { MouseEvent, useEffect, useRef, useState } from 'react';
import ExpandableTextArea from '#/components/ExpandableTextArea';
import { ArrowDownIcon, ArrowUpIcon, MicIcon, RotateCcwIcon, ShieldAlertIcon, SquareIcon } from 'lucide-react';

interface ChatIdProps {
	initialMessages: Message[];
	chatId: string;
};

const ChatId = ({ initialMessages, chatId }: ChatIdProps) => {
	const user = useUser();
	const queryClient = useQueryClient();
	const initialLoadRef = useRef(false);
	const messageBoxRef = useRef<HTMLDivElement>(null);
	const [isRecording, setIsRecording] = useState(false);
	const submitButtonRef = useRef<HTMLButtonElement>(null);
	const [messageBoxHeight, setMessageBoxHeight] = useState(0);
	const { messagesRef, messageEndRef, isAtBottom, scrollToBottom } = useScrollAnchor();
	const { messages, error, handleSubmit, isLoading, input, handleInputChange, stop, reload } = useChat({
		api: '/api/chat',
		initialMessages,
		body: { chatId },
		onError: (error) => {
			console.error('Chat Error :>>', error);
			toast.error(error.message);
		},
		onFinish: () => {
			queryClient.invalidateQueries({ queryKey: ['chatHistory'] });
		}
	});

	useEffect(() => {
		if (initialMessages.length > 0 && !initialLoadRef.current) {
			const lastMessage = initialMessages[initialMessages.length - 1]
			if (lastMessage.role === 'user') {
				initialLoadRef.current = true;
				reload();
			}
		}
	}, [initialMessages, reload]);

	useEffect(() => {
		// Scroll to the bottom every time messages change
		scrollToBottom();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [messages]);

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

	const handleSubmitButtonClick = (e: MouseEvent<HTMLButtonElement>) => {
		const trimmedValue = input.replace(/^[\s\n]+|[\s\n]+$/g, '');

		// Check if the trimmed value is empty
		trimmedValue.length === 0 && e.preventDefault();
	};

	const handleRegenerate = () => {
		reload({ options: { body: { chatId, isReload: true } } });
	};

	return (
		<div className='flex flex-col h-full relative -m-4 md:-mx-8'>
			<div
				ref={messagesRef}
				className={cn(
					'flex-1 flex flex-col w-full overflow-y-auto scroll-smooth transition-all duration-300 px-2 sm:px-12 scrollbar-thin',
					messages.length === 0 ? 'pb-6' : 'pb-2'
				)}
				style={messageBoxHeight > 0 ? { marginBottom: messageBoxHeight - 24 } : {}}
			>
				{messages.length > 0 && (
					<>
						{messages.filter(message => message.role !== 'system').map((message, idx) => (
							<ChatMessage
								key={idx}
								message={message}
								username={`${user.email}`}
							/>
						))}

						{error && <div className='mt-2 p-3.5 flex flex-row items-start gap-x-2.5 bg-[#CB1A14]/10 rounded-lg'>
							<ShieldAlertIcon className='w-5 h-5 text-[#CB1A14] flex-shrink-0' />
							<p className='text-[#CB1A14]'>{error.message}</p>
						</div>}

						<div className='flex mt-2 mb-4'>
							<Button
								className={cn('h-auto px-2 py-1 text-xs mx-auto hidden', isLoading && 'inline-flex')}
								variant='outline'
								size='sm'
								onClick={stop}
							>
								<SquareIcon className='w-3 h-3 mr-2' />
								Stop generation
							</Button>
							<Button
								className={cn('h-auto px-2 py-1 text-xs mx-auto hidden', messages.length > 1 && (messages.length & 1) === 0 && !isLoading && 'inline-flex')}
								variant='outline'
								size='sm'
								onClick={handleRegenerate}
							>
								<RotateCcwIcon className='w-3 h-3 mr-2' />
								Regenerate
							</Button>
						</div>

						<div ref={messageEndRef} />
					</>
				)}
			</div>

			<div ref={messageBoxRef} className='absolute -bottom-8 left-0 right-0 bg-primary/5 dark:bg-black p-2 flex flex-col z-10 overflow-x-hidden'>
				<div className={cn('absolute left-1/2 -translate-x-1/2 -top-12 opacity-100 visible transition-all duration-300', isAtBottom && 'opacity-0 invisible')}>
					<button
						type='button'
						onClick={scrollToBottom}
						className='text-white dark:text-black p-0.5 border border-black rounded-lg dark:border-white bg-black dark:bg-white transition-colors'
					>
						<ArrowDownIcon className='w-5 h-5' />
					</button>
				</div>

				{/* TODO: Add drawer for audio input... */}

				<form
					onSubmit={e => !isRecording && !isLoading && handleSubmit(e, {})}
					className='relative flex flex-col mx-0 sm:mx-12 sm:mt-1 bg-transparent border border-primary/25 rounded-2xl'>
					<ExpandableTextArea
						disabled={isLoading}
						placeholder={isLoading ? 'Just a moment…' : `Send a message…`}
						autoComplete='off'
						value={input}
						onChange={handleInputChange}
						className='m-0 w-full max-h-40 resize-none outline-none transition-all border-0 bg-transparent py-3 md:py-3.5 px-10 md:px-12 focus:ring-0 focus-visible:ring-0 placeholder-primary/50 scrollbar-thin'
					/>

					<div className='absolute flex bottom-6 md:bottom-[1.75rem] translate-y-1/2 left-2 md:left-3'>
						{isRecording ? (
							<Loader type='spinner' size={28} className='leading-[0]' />
						) : (
							<label
								htmlFor='chatImage'
								className={cn(
									'text-white dark:text-black cursor-pointer p-0.5 border border-black rounded-lg dark:border-white bg-black dark:bg-white',
									isLoading && 'opacity-50 pointer-events-none grayscale'
								)}
							>
								<MicIcon className='w-5 h-5' />
							</label>
						)}
					</div>

					<div className='absolute flex bottom-6 md:bottom-[1.75rem] translate-y-1/2 right-2 md:right-3'>
						{isLoading ? (
							<Loader type='spinner' size={28} className='leading-[0]' />
						) : (
							<button
								disabled={isLoading || input.trim().length === 0}
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
					<p className='text-xs text-muted-foreground'>Gynora can make mistakes. Check important info.</p>
				</div>
			</div>
		</div>
	);
};

export default ChatId;

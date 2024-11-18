'use client';

import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-toastify';
import { Button } from '#/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import HistoryCard from '#/components/HistoryCard';
import { getChatHistory } from '#/lib/actions/queries';

const History = () => {
	const { isPending: getChatHistoryLoading, data: chatHistory } = useQuery({
		queryKey: ['chatHistory'],
		queryFn: async () => {
			try {
				const chatHistory = await getChatHistory();

				return chatHistory;
			} catch (error) {
				toast.error('Failed to fetch your chat history ;(');
				throw error;
			}
		}
	});

	if (getChatHistoryLoading) {
		return (
			<div className='flex flex-col h-full'>
				<div className='space-y-2 my-2'>
					<h1 className='text-3xl sm:text-4xl font-semibold text-black dark:text-white'>
						Your Sessions
					</h1>
					<div className='grid grid-cols-1 gap-6 py-4 md:grid-cols-2 lg:grid-cols-3'>
						<HistoryCard.Skeleton />
						<HistoryCard.Skeleton />
						<HistoryCard.Skeleton />
						<HistoryCard.Skeleton />
						<HistoryCard.Skeleton />
						<HistoryCard.Skeleton />
					</div>
				</div>
			</div>
		)
	}

	if (!chatHistory?.length) {
		return (
			<div className='h-full flex flex-col items-center justify-center'>
				<Image
					src='/images/empty-state-dark.svg'
					height='200'
					width='200'
					alt='No sessions, yet ;)'
					fetchPriority='high'
					className='hidden dark:block'
				/>
				<Image
					src='/images/empty-state-light.svg'
					height='200'
					width='200'
					alt='No sessions, yet ;)'
					fetchPriority='high'
					className='block dark:hidden'
				/>
				<h2 className='text-2xl font-semibold mt-6'>No sessions, yet ;)</h2>
				<p className='text-muted-foreground text-sm mt-2'>Have your first session by clicking the link below</p>
				<div className='mt-6'>
					<Link href='/chat'>
						<Button className='text-white transition-colors duration-300 bg-core hover:bg-core-secondary' size='sm'>
							Start new session
						</Button>
					</Link>
				</div>
			</div>
		)
	}
	
	return (
		<div className='flex flex-col h-full'>
			<div className='space-y-2 my-2'>
				<h1 className='text-3xl sm:text-4xl font-semibold text-black dark:text-white'>
					Your Sessions
				</h1>
				<div className='grid grid-cols-1 gap-6 py-4 md:grid-cols-2 lg:grid-cols-3'>
					{chatHistory.map(chat => (
						<HistoryCard
							key={chat.id}
							id={chat.id}
							name={chat.name}
							lastUpdated={chat.lastUpdated}
							lastMessageContent={chat.lastMessageContent}
						/>
					))}
				</div>
			</div>
		</div>
	);
}

export default History;

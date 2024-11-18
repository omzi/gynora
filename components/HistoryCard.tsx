'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card } from '#/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '#/components/ui/button';
import { TrashIcon, PenIcon } from 'lucide-react';
import { Skeleton } from '#/components/ui/skeleton';
import { useRenameModal } from '#/hooks/useRenameModal';
import { useConfirmDelete } from '#/hooks/useConfirmDelete';

interface HistoryCardProps {
	id: string;
	name: string;
	lastUpdated: string;
	lastMessageContent: string;
};

const HistoryCard = ({
	id,
	name,
	lastUpdated,
	lastMessageContent
}: HistoryCardProps) => {
	const { onOpen: openRenameModal } = useRenameModal();
	const { onOpen: openConfirmDeleteModal } = useConfirmDelete();
	const lastUpdatedLabel = formatDistanceToNow(lastUpdated, { addSuffix: true });

	return (
		<Card className='relative overflow-hidden rounded-lg shadow' tabIndex={-1}>
			<Link href={`/chat/${id}`}>
				<div className='p-3 border-b flex gap-x-3 items-center'>
					<Image
						src='/images/logo.png'
						alt={name}
						width={48}
						height={48}
						className='object-cover rounded-full flex-shrink-0'
						fetchPriority='high'
					/>
					<div className='flex-1 leading-none'>
						<h2 className='text-lg font-medium line-clamp-1'>{name}</h2>
						<p className='capitalize text-muted-foreground'>{lastUpdatedLabel}</p>
					</div>
				</div>
			</Link>
			<div className='p-3 bg-white dark:bg-black'>
				<div className='flex items-center justify-end'>
					<div className='flex gap-x-2'>
						<Button onClick={() => openRenameModal(id, name)} className='flex rounded-full border-black dark:border-white' variant='outline' size='icon'>
							<PenIcon className='w-5 h-5' />
						</Button>
						<Button onClick={() => openConfirmDeleteModal(id)} className='flex rounded-full' variant='destructive' size='icon'>
							<TrashIcon className='w-5 h-5' />
						</Button>
					</div>
				</div>
			</div>
		</Card>
	);
};

export default HistoryCard;

HistoryCard.Skeleton = function HistoryCardSkeleton() {
	return (
		<Card className='relative overflow-hidden rounded-lg shadow'>
			<div className='p-3 border-b flex gap-x-3 items-center'>
				<Skeleton className='w-12 h-12 rounded-full' />
				<div className='flex-1 space-y-1.5'>
					<Skeleton className='w-24 h-5 rounded' />
					<Skeleton className='w-16 h-4 rounded' />
				</div>
			</div>

			<div className='p-3 bg-white dark:bg-black'>
				<div className='flex items-center justify-end'>
					<div className='flex gap-x-2'>
						<Skeleton className='w-10 h-10 rounded-full' />
						<Skeleton className='w-10 h-10 rounded-full' />
					</div>
				</div>
			</div>
		</Card>
	)
};

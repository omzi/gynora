'use client';

import Link from 'next/link';
import { EyeIcon } from 'lucide-react';
import { Card } from '#/components/ui/card';
import { Badge } from '#/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '#/components/ui/button';
import { Skeleton } from '#/components/ui/skeleton';

interface AffirmationCardProps {
	id: string;
	category: string;
	tone: string;
	createdAt: string;
};

const AffirmationCard = ({
	id,
	category,
	tone,
	createdAt
}: AffirmationCardProps) => {
	const createdAtLabel = formatDistanceToNow(createdAt, { addSuffix: true });

	return (
		<Card className='relative overflow-hidden rounded-lg shadow' tabIndex={-1}>
			<Link href={`/affirmations/${id}`}>
				<div className='p-3 border-b leading-none'>
					<h2 className='text-lg font-medium line-clamp-1'>{category}</h2>
					<p className='capitalize text-muted-foreground'>{createdAtLabel}</p>
				</div>
			</Link>
			<div className='p-3 bg-white dark:bg-black'>
				<div className='flex items-center justify-between'>
					<Badge className='px-2 py-1 rounded-md bg-core hover:bg-core text-white hover:text-white text-xs font-medium'>
						{tone}
					</Badge>
					<Link href={`/affirmations/${id}`}>
						<Button onClick={() => { }} className='flex rounded-full border-black dark:border-white' variant='outline' size='icon'>
							<EyeIcon className='w-5 h-5' />
						</Button>
					</Link>
				</div>
			</div>
		</Card>
	);
};

export default AffirmationCard;

AffirmationCard.Skeleton = function AffirmationCardSkeleton() {
	return (
		<Card className='relative overflow-hidden rounded-lg shadow'>
			<div className='p-3 border-b space-y-1.5'>
				<Skeleton className='w-24 h-5 rounded' />
				<Skeleton className='w-16 h-4 rounded' />
			</div>

			<div className='p-3 bg-white dark:bg-black'>
				<div className='flex items-center justify-between'>
					<Skeleton className='w-24 h-[26px] rounded-md' />
					<Skeleton className='w-10 h-10 rounded-full' />
				</div>
			</div>
		</Card>
	)
};

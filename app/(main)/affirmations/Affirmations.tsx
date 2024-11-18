'use client';

import Image from 'next/image';
import { toast } from 'react-toastify';
import { PlusIcon } from 'lucide-react';
import { Button } from '#/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { getAffirmations } from '#/lib/actions/queries';
import AffirmationCard from '#/components/AffirmationCard';
import { useAffirmationModal } from '#/hooks/useAffirmationModal';

const Affirmations = () => {
	const affirmationModal = useAffirmationModal();
	const { isPending: getAffirmationsLoading, data: affirmations } = useQuery({
		queryKey: ['affirmations'],
		queryFn: async () => {
			try {
				const affirmations = await getAffirmations();

				return affirmations;
			} catch (error) {
				toast.error('Failed to fetch your affirmations ;(');
				throw error;
			}
		}
	});

	if (getAffirmationsLoading) {
		return (
			<div className='flex flex-col h-full'>
				<div className='space-y-2 my-2'>
					<div className='flex flex-col items-center justify-between gap-3 sm:flex-row'>
						<h1 className='text-3xl sm:text-4xl font-semibold text-black dark:text-white'>
							Your Affirmations
						</h1>
						<Button disabled className='text-white bg-core hover:bg-purple-600'>
							<PlusIcon className='w-4 h-4 mr-2' />
							New Affirmation
						</Button>
					</div>
					<div className='grid grid-cols-1 gap-6 py-4 md:grid-cols-2 lg:grid-cols-3'>
						<AffirmationCard.Skeleton />
						<AffirmationCard.Skeleton />
						<AffirmationCard.Skeleton />
						<AffirmationCard.Skeleton />
						<AffirmationCard.Skeleton />
						<AffirmationCard.Skeleton />
					</div>
				</div>
			</div>
		)
	}

	if (!affirmations?.length) {
		return (
			<div className='h-full flex flex-col items-center justify-center'>
				<Image
					src='/images/empty-state-dark.svg'
					height='200'
					width='200'
					alt='No affirmations, yet ;)'
					fetchPriority='high'
					className='hidden dark:block'
				/>
				<Image
					src='/images/empty-state-light.svg'
					height='200'
					width='200'
					alt='No affirmations, yet ;)'
					fetchPriority='high'
					className='block dark:hidden'
				/>
				<h2 className='text-2xl font-semibold mt-6'>No affirmations, yet ;)</h2>
				<p className='text-muted-foreground text-sm mt-2'>Create your first affirmation by clicking the button below</p>
				<div className='mt-6'>
					<Button onClick={affirmationModal.onOpen} className='text-white transition-colors duration-300 bg-core hover:bg-core-secondary' size='sm'>
						Create new affirmation
					</Button>
				</div>
			</div>
		)
	}

	return (
		<div className='flex flex-col h-full'>
			<div className='space-y-2 my-2'>
				<div className='flex flex-col items-center justify-between gap-3 sm:flex-row'>
					<h1 className='text-3xl sm:text-4xl font-semibold text-black dark:text-white'>
						Your Affirmations
					</h1>
					<Button onClick={affirmationModal.onOpen} className='text-white bg-core hover:bg-purple-600'>
						<PlusIcon className='w-4 h-4 mr-2' />
						New Affirmation
					</Button>
				</div>

				<div className='grid grid-cols-1 gap-6 py-4 md:grid-cols-2 lg:grid-cols-3'>
					{affirmations.map(affirmation => (
						<AffirmationCard
							key={affirmation.id}
							id={affirmation.id}
							category={affirmation.category}
							tone={affirmation.tone}
							createdAt={affirmation.createdAt}
						/>
					))}
				</div>
			</div>
		</div>
	);
}

export default Affirmations;

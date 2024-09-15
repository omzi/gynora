'use client';

import Image from 'next/image';
import { cn } from '#/lib/utils';
import { XIcon } from 'lucide-react';
import Loader from 'react-ts-loaders';
import { Button } from '#/components/ui/button';

interface ChatImageSelectionProps {
	preview: string;
	isUploading: boolean;
	handleRemoveImage: () => void;
}

const ChatImageSelection = ({
	preview,
	isUploading,
	handleRemoveImage
}: ChatImageSelectionProps) => {
	return (
		<div className={cn('flex flex-nowrap gap-2 mx-0 sm:mx-12 mt-2 mb-1.5', !preview && 'hidden')}>
			{preview && (
				<div className='group relative h-14 w-14 inline-block text-sm'>
					<Button className='h-full w-full p-0 overflow-hidden rounded-xl border'>
						<Image 
							src={preview}
							width={56}
							height={56}
							alt='Chat image'
							className='object-cover w-full h-full'
						/>
					</Button>
					<div className={cn(
						'absolute inset-0 h-14 w-14 flex items-center justify-center bg-black/50 rounded-xl opacity-0 transition-opacity',
						isUploading && 'opacity-100'
					)}>
						<Loader type='spinner' size={28} className='leading-[0] text-white' />
					</div>
					<Button onClick={handleRemoveImage} size='icon' variant='outline' className='absolute right-1 top-1 -translate-y-1/2 translate-x-1/2 border p-0.5 w-6 h-6 rounded-full'>
						<XIcon />
					</Button>
				</div>
			)}
		</div>
	);
}

export default ChatImageSelection;

'use client';

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogClose,
	DialogFooter,
	DialogDescription
} from '#/components/ui/dialog';
import { cn } from '#/lib/utils';
import { MouseEvent } from 'react';
import Loader from 'react-ts-loaders';
import { toast } from 'react-toastify';
import { AlertTriangle } from 'lucide-react';
import { Button } from '#/components/ui/button';
import { deleteChat } from '#/lib/actions/mutations';
import { usePathname, useRouter } from 'next/navigation';
import { useConfirmDelete } from '#/hooks/useConfirmDelete';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const ConfirmDeleteModal = () => {
	const router = useRouter();
	const pathname = usePathname();
	const queryClient = useQueryClient();
	const { isOpen, onClose, initialValues } = useConfirmDelete();
	const { mutate: deleteChatMutation, isPending: deleteChatLoading } = useMutation({
		mutationFn: async (chatId: string) => {
			try {
				const chat = await deleteChat(chatId);

				console.log('Delete Chat Mutation :>>', chat);
				return chat;
			} catch (error) {
				throw error;
			}
		},
		onError: (error) => {
			console.log('deleteChat Error :>>', error);
			toast.error('Failed to delete chat ;(');
			onClose();
		},
		onSuccess: () => {
			toast.success('Chat deleted!');
			onClose();

			queryClient.invalidateQueries({ queryKey: ['chatHistory'] });

			if (pathname !== '/history') {
				router.push('/chats');
			}
		}
	});

	const onConfirm = (e: MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();

		deleteChatMutation(initialValues.id);
	};

	const handleModalClose = () => {
		if (deleteChatLoading) return;

		onClose();
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleModalClose}>
			<DialogContent showCloseButton={false} className='rounded-lg w-[calc(100%-20px)] sm:w-[24rem] md:w-[30rem]'>
				<DialogHeader>
					<div className='sm:flex sm:items-start'>
						<div className='flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto bg-red-100 rounded-full sm:mx-0 sm:h-10 sm:w-10'>
							<AlertTriangle className='w-6 h-6 text-red-600' />
						</div>
						<div className='mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left'>
							<DialogTitle className='text-base font-semibold leading-6 text-gray-900 dark:text-gray-100'>Delete chat?</DialogTitle>
							<DialogDescription>
								<VisuallyHidden.Root>
									Delete chat?
								</VisuallyHidden.Root>
							</DialogDescription>
							<div className='my-2'>
								<p className='text-sm text-gray-500'>
									Proceeding with this action will permanently delete the chat & all of its associated content. Are you sure you want to proceed with deleting the chat & its contents?
								</p>
							</div>
						</div>
					</div>
				</DialogHeader>
				<DialogFooter>
					<div className='flex justify-center gap-x-4 sm:justify-end'>
						<DialogClose asChild>
							<Button type='button' variant='outline'>Cancel</Button>
						</DialogClose>
						<Button type='button' className='relative' disabled={deleteChatLoading} onClick={onConfirm}>
							<span className={cn('opacity-100 flex items-center', deleteChatLoading && 'opacity-0')}>
								Confirm
							</span>
							{deleteChatLoading && (
								<div className='absolute flex items-center justify-center w-full h-full'>
									<Loader type='spinner' size={28} className='text-white leading-[0]' />
								</div>
							)}
						</Button>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default ConfirmDeleteModal;

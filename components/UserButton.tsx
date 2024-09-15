'use client';

import Link from 'next/link';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuTrigger
} from '#/components/ui/dropdown-menu';
import { useLogOut } from '#/hooks/useLogOut';
import { HelpCircleIcon, LogOutIcon, UserIcon } from 'lucide-react';
import { Button } from '#/components/ui/button';
import { Skeleton } from '#/components/ui/skeleton';
import { MouseEvent as ReactMouseEvent } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar';

interface UserButtonProps {
	profilePicture: string;
	profilePictureAlt: string;
	fullName: string;
	email: string;
};

const UserButton = ({
	profilePicture,
	profilePictureAlt,
	fullName,
	email
}: UserButtonProps) => {
	const { onOpen } = useLogOut();
	const handleLogOutClick = (e: ReactMouseEvent<HTMLDivElement, MouseEvent>) => {
		onOpen();
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant='ghost' className='relative w-10 h-10 rounded-full'>
					<Avatar className='w-10 h-10'>
						<AvatarImage src={profilePicture} alt={profilePictureAlt} />
						<AvatarFallback>
							<Skeleton className='w-10 h-10 rounded-full' />
						</AvatarFallback>
					</Avatar>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className='w-60' align='end' forceMount>
				<DropdownMenuLabel className='font-normal'>
					<div className='flex flex-col space-y-1 gap-2'>
						<p className='text-base font-medium leading-none'>{fullName}</p>
						<p className='text-xs leading-none text-muted-foreground'>
							{email}
						</p>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<Link href='/profile'>
						<DropdownMenuItem>
							<UserIcon className='h-4 w-4 mr-2' />
							Profile
						</DropdownMenuItem>
					</Link>
					<Link href='https://git.new/GynoraRepo' target='_blank'>
						<DropdownMenuItem>
							<HelpCircleIcon className='h-4 w-4 mr-2' />
							About
						</DropdownMenuItem>
					</Link>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={handleLogOutClick}>
					<LogOutIcon className='h-4 w-4 mr-2' />
					Log Out
					<DropdownMenuShortcut className='opacity-100'>
						<kbd className='ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground'>
							<span className='text-xs'>⌘</span>L
						</kbd>
					</DropdownMenuShortcut>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default UserButton;

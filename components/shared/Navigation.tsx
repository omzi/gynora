'use client';

import Link from 'next/link';
import Image from 'next/image';
import Logo from '#/components/shared/Logo';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { Label } from '#/components/ui/label';
import { Button } from '#/components/ui/button';
import ModeToggle from '#/components/ModeToggle';
import UserButton from '#/components/UserButton';
import { Skeleton } from '#/components/ui/skeleton';
import { cn, generateDefaultAvatar } from '#/lib/utils';
import { FC, ReactNode, useEffect, useState } from 'react';
import { BellIcon, ChevronLeftIcon, ChevronRightIcon, HistoryIcon, LayoutDashboardIcon, LightbulbIcon, MenuIcon, Mic2Icon, PenSquareIcon, SparklesIcon, UserRoundIcon, ZapIcon } from 'lucide-react';

type NavigationProps = {
	children: ReactNode;
	hideOverflow?: boolean;
}

const menuItems = [
	{ path: '/dashboard', icon: LayoutDashboardIcon, text: 'Dashboard' },
	{ path: '/chat', icon: SparklesIcon, text: 'Chat' },
	{ path: '/history', icon: HistoryIcon, text: 'History' },
	{ path: '/affirmations', icon: ZapIcon, text: 'Affirmations' },
	{ path: '/profile', icon: UserRoundIcon, text: 'Profile' }
];

const Navigation: FC<NavigationProps> = ({ children, hideOverflow }) => {
	const pathname = usePathname();
	const { data: session } = useSession();
	const [menuOpen, setMenuOpen] = useState(false);
	const [isCollapsed, setIsCollapsed] = useState(false);

	useEffect(() => {
		if (pathname.startsWith('/chat/')) {
			setIsCollapsed(true);
		}
	}, [pathname]);

	const openMenu = () => setMenuOpen(true);
	const closeMenu = () => setMenuOpen(false);
	const toggleCollapse = () => setIsCollapsed(!isCollapsed);

	return (
		<>
			<div onClick={closeMenu} className={cn(
				'fixed invisible inset-0 z-[1] bg-black bg-opacity-0 transition-all duration-300',
				menuOpen && 'visible lg:invisible bg-opacity-50 lg:bg-opacity-0'
			)}></div>
			<aside
				id='sidebar'
				className={cn(
					'fixed top-0 left-0 z-40 h-screen border-r shadow lg:shadow-none transition-all duration-300 -translate-x-full lg:translate-x-0',
					menuOpen && 'translate-x-0',
					isCollapsed ? 'w-64 lg:w-24' : 'w-64'
				)}
				aria-label='Sidebar'
			>
				<div className='h-full py-4 flex flex-col bg-background'>
					<Link href='/' className={cn('flex items-center mx-6 mb-4 w-fit', isCollapsed && 'lg:justify-center lg:mx-auto')}>
						<Image
							src={'/images/logo.png'}
							height={71}
							width={112}
							alt='Gynora Logo'
							fetchPriority='high'
							className='h-10 w-auto'
						/>
					</Link>

					<ul className='space-y-2 font-medium flex-grow'>
						{menuItems.map((item, idx) => (
							<Link
								key={idx}
								href={item.path}
								onClick={closeMenu}
								className={cn(
									'flex items-center px-6 py-3 border-r-4 border-transparent text-black transition-colors duration-150 dark:text-white hover:bg-purple-600 hover:text-white group',
									pathname.startsWith(item.path) && 'bg-core/10 border-core text-core shadow-md [&>svg]:text-core',
									isCollapsed && 'lg:justify-center lg:px-3'
								)}>
								<item.icon className='w-5 h-5 text-black dark:text-white transition-colors duration-150 group-hover:text-white' />
								<span className={cn('flex-1 text-base ms-3 whitespace-nowrap leading-[0]', isCollapsed && 'lg:hidden')}>
									{item.text}
								</span>
							</Link>
						))}
					</ul>

					<div className='mt-auto -mb-4'>
						<div className='h-[1px] w-[calc(100%-4px)] bg-primary/10' />
						<div className={cn('flex items-center justify-between p-4 gap-x-4', isCollapsed && 'justify-center')}>
							<div className={cn('flex flex-col gap-y-1 flex-shrink-0', isCollapsed && 'lg:hidden')}>
								<Label className='text-xs uppercase'>Theme</Label>
								<span className='text-xs text-muted-foreground whitespace-nowrap'>
									Customize how Gynora looks <br /> on your device
								</span>
							</div>
							<ModeToggle />
						</div>
					</div>

					<div className='absolute top-0 right-0 w-1 h-full bg-primary/10' />
				</div>
			</aside>

			<main className={cn('flex flex-col ml-0 h-svh transition-all duration-300', isCollapsed ? 'lg:ml-24' : 'lg:ml-64')}>
				<nav className='flex items-center justify-between w-full shadow-sm dark:bg-black px-3 py-4'>
					<MenuIcon
						onClick={openMenu}
						role='button'
						className={cn(
							'h-8 w-8 block lg:hidden text-muted-foreground mr-2.5'
						)}
					/>
					<Button onClick={toggleCollapse} variant='outline' size='icon' className='hidden lg:flex rounded-full flex-shrink-0'>
						{isCollapsed ? (
							<ChevronRightIcon className='text-muted-foreground stroke-1' />
						) : (
							<ChevronLeftIcon className='text-muted-foreground stroke-1' />
						)}
					</Button>

					<Logo newTab className='block lg:hidden' />
					<div className='hidden lg:block flex-1' />

					{!session
						? <Skeleton className='w-10 h-10 rounded-full' />
						: <UserButton
							profilePicture={session.user.image || generateDefaultAvatar(`${session?.user?.email}`)}
							profilePictureAlt={`${session?.user?.name}'s Profile Picture`}
							fullName={`${session?.user?.name}`}
							email={`${session?.user?.email}`}
						/>}
				</nav>
				<div className={cn('p-4 md:px-8 flex-1 overflow-y-auto', hideOverflow && 'overflow-y-visible')}>
					{children}
				</div>
			</main>
		</>
	)
}

export default Navigation;

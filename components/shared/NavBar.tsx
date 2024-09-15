'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Button } from '#/components/ui/button';
import ModeToggle from '#/components/ModeToggle';
import { cn, getScrollbarWidth } from '#/lib/utils';
import { ArrowRight, InfoIcon, LayoutGridIcon, LightbulbIcon, MenuIcon, StarIcon, TwitterIcon } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '#/components/ui/dropdown-menu';

interface NavBarProps {
	isAuthenticated: boolean;
	isPublicLayout?: boolean;
	isPrivateLayout?: boolean;
};

const NavBar = ({ isAuthenticated, isPublicLayout, isPrivateLayout }: NavBarProps) => {
	const [menuOpen, setMenuOpen] = useState(false);

	const handleOnOpenChange = (menuOpen: boolean) => {
		setMenuOpen(menuOpen);
	};

	useEffect(() => {
		const html = document.documentElement;
		const scrollbarWidth = getScrollbarWidth();

		if (menuOpen) {
			html.classList.add('no-scroll');
			html.style.paddingRight = `${scrollbarWidth}px`;
		} else {
			html.classList.remove('no-scroll');
			html.style.paddingRight = '0';
		}

		return () => {
			html.classList.remove('no-scroll');
			html.style.paddingRight = '0';
		};
	}, [menuOpen]);

	return (
		<>
			{/* Overlay */}
			<div className={cn(
				'fixed invisible inset-0 z-10 bg-black bg-opacity-0 transition-all duration-300',
				menuOpen && 'visible bg-opacity-50'
			)}></div>

			{/* Fixed navbar */}
			{!isPrivateLayout && (
				<nav className='fixed z-10 flex justify-between p-2 rounded-full bg-black dark:bg-white/50 dark:backdrop-blur-md left-1/2 mt-5 -translate-x-1/2 outline-2 outline-black dark:outline-white/50 outline outline-offset-4 w-[90svw] sm:w-96'>
					<div className='flex items-center gap-x-2'>
						<DropdownMenu onOpenChange={handleOnOpenChange} modal={false}>
							<DropdownMenuTrigger asChild>
								<Button size='icon' className='bg-transparent hover:bg-white/20 rounded-full'>
									<MenuIcon className='text-white' />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent loop side='bottom' sideOffset={15} align='start' className='w-[calc(90svw-16px)] sm:w-[calc(24rem-16px)] p-0'>
								<Link href='https://link.omzi.dev/email' target='_blank'>
									<DropdownMenuItem className='py-3 px-3 w-full cursor-pointer'>
										<LightbulbIcon className='h-4 w-4 mr-2' />
										Feedback
									</DropdownMenuItem>
								</Link>
								<hr />
								<Link href='https://git.new/GynoraRepo' target='_blank'>
									<DropdownMenuItem className='py-3 px-3 w-full cursor-pointer'>
										<StarIcon className='h-4 w-4 mr-2' />
										Star on GitHub
									</DropdownMenuItem>
								</Link>
							</DropdownMenuContent>
						</DropdownMenu>

						<Link href='/'>
							<Image
								width={36}
								height={36}
								alt='Logo'
								src='/images/logo.png'
							/>
						</Link>
					</div>
					<div className='flex items-center gap-x-2'>
						{/* Authenticated... */}
						{isAuthenticated && (
							<Link href='/dashboard'>
								<Button className='w-auto h-8 mr-2 rounded-full px-4 text-white bg-core' size='sm'>
									<LayoutGridIcon className='w-4 h-4 mr-2' />
									Dashboard
								</Button>
							</Link>
						)}

						{/* Unauthenticated... */}
						{!isAuthenticated && (
							<Link href='/auth/sign-in'>
								<Button className='w-auto h-8 rounded-full px-4 text-white bg-core'>
									Sign In
									<ArrowRight className='w-4 h-4 ml-2' />
								</Button>
							</Link>
						)}

						<Link href='https://link.omzi.dev/twitter' target='_blank'>
							<Button size='icon' className='bg-white/20 dark:bg-black hover:bg-white/20 rounded-full'>
								<TwitterIcon className='text-white' />
							</Button>
						</Link>
					</div>
				</nav>
			)}

			{/* Normal navbar */}
			<nav className={cn(
				'flex items-center justify-between w-full px-8 pb-4 pt-[1.625rem] dark:bg-core',
				isPublicLayout && 'hidden lg:flex'
			)}>
				<Link href='/' className='hidden xs:block'>
					<Image
						src='/images/logo-text-dark.png'
						height={40}
						width={132}
						alt='Gynora Logo'
						className='w-auto h-10 hidden dark:block'
					/>
					<Image
						src='/images/logo-text-light.png'
						height={40}
						width={132}
						alt='Gynora Logo'
						className='w-auto h-10 block dark:hidden'
					/>
				</Link>
				<Link href='/' className='block xs:hidden'>
					<Image
						src='/images/logo.png'
						height={40}
						width={40}
						alt='Gynora Logo'
					/>
				</Link>

				<div className='flex items-center gap-x-2'>
					<ModeToggle />
					<Link href='https://git.new/GynoraRepo' target='_blank'>
						<Button className='bg-white dark:bg-black hover:bg-gray-500/5 dark:hover:bg-white/25 dark:hover:border-core rounded-full shadow-sm p-1 h-10' variant='outline'>
							<InfoIcon className='hidden xs:inline w-8 h-8 mr-2 p-1.5 rounded-full bg-black/10 dark:bg-white/25 text-black dark:text-white' />
							<span className='xs:pr-4 px-2 xs:px-0 text-black dark:text-white'>About</span>
						</Button>
					</Link>
				</div>
			</nav>
		</>
	)
}

export default NavBar;

import Link from 'next/link';
import Image from 'next/image';
import { FC, HTMLAttributes } from 'react';

const Logo: FC<{
	newTab?: boolean,
	className?: HTMLAttributes<HTMLAnchorElement>['className']
}> = ({ newTab = false, className }) => {
	return (
		<Link href={'/'} target={newTab ? '_blank' : '_self'} className={className}>
			<Image
				src='/images/logo-text-dark.png'
				height={32}
				width={120}
				alt='Gynora Logo'
				fetchPriority='high'
				className='w-auto h-8 hidden dark:block'
			/>
			<Image
				src='/images/logo-text-light.png'
				height={32}
				width={120}
				alt='Gynora Logo'
				fetchPriority='high'
				className='w-auto h-8 block dark:hidden'
			/>
		</Link>
	);
};

export default Logo;

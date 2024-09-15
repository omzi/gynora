import { FC, ReactNode } from 'react';
import { toast } from 'react-toastify';
import Loader from 'react-ts-loaders';

export interface AuthSocialButtonProps {
	loading: boolean;
	text: string;
	icon: ReactNode | string;
	onClick: () => void;
}

const AuthSocialButton: FC<AuthSocialButtonProps> = ({
	loading,
	text,
	icon,
	onClick
}) => {
	const isSVGString = typeof icon === 'string' && icon.startsWith('<svg');

	return (
		<button
			type='button'
			disabled={loading}
			aria-disabled={loading}
			onClick={() => toast.info('Temporarily disabled ;(')}
			className='h-12 inline-flex justify-center items-center w-full px-4 py-2 text-gray-500 bg-white hover:bg-gray-50 rounded-md shadow-sm ring-1 ring-inset ring-gray-300 disabled:bg-gray-200 disabled:hover:bg-gray-200 focus:outline-offset-0'
		>
			{loading ? (
				<Loader size={24} className='leading-[0] text-black' />
			) : (
				<>
					<span className='sr-only'>{text}</span>
					{isSVGString ? (
						<div dangerouslySetInnerHTML={{ __html: icon as string }} />
					) : (
						icon
					)}
				</>
			)}
		</button>
	);
};

export default AuthSocialButton;

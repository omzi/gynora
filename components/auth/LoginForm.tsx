'use client';

import * as z from 'zod';
import Link from 'next/link';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage
} from '#/components/ui/form';
import Loader from 'react-ts-loaders';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { AuthSchema } from '#/lib/validations';
import FormError from '#/components/FormError';
import { useState, useTransition } from 'react';
import { Button } from '#/components/ui/button';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import FormSuccess from '#/components/FormSuccess';
import { zodResolver } from '@hookform/resolvers/zod';
import AuthSocialButton from '#/components/AuthSocialButton';
import { DEFAULT_SIGN_IN_REDIRECT, SIGN_IN_ROUTE } from '#/lib/utils';
import checkUserVerification from '#/lib/actions/checkUserVerification';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

const SignInSchema = AuthSchema.pick({
	password: true,
	email: true
});

const LoginForm = () => {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const next = searchParams.get('next');
	const [isDisabled, setIsDisabled] = useState(false);
	const [isSubmitting, startTransition] = useTransition();
	const [googleLoading, setGoogleLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | undefined>('');
	const [successMessage, setSuccessMessage] = useState<string | undefined>('');

	const form = useForm<z.infer<typeof SignInSchema>>({
		resolver: zodResolver(SignInSchema),
		mode: 'all',
		defaultValues: {
			email: '',
			password: ''
		}
	});
	const { handleSubmit } = form;

	const socialAction = async (action: 'google') => {
		setErrorMessage('');
		setSuccessMessage('');
		setIsDisabled(true);
		setGoogleLoading(true);
		
		try {
			await signIn(action);
		} catch (error: any) {
			// console.error('Google Sign-In Error :>>', error);

			setIsDisabled(false);
			setGoogleLoading(false);
			setErrorMessage(error.message ?? 'An error occurred during Google sign in');
		}
	};

	const onSubmit = async (data: z.infer<typeof SignInSchema>) => {
		// console.log('Sign-In Data :>>', data);
		setErrorMessage('');
		setSuccessMessage('');
		setIsDisabled(true);
		setGoogleLoading(true);
		const url = pathname === SIGN_IN_ROUTE ? (next || DEFAULT_SIGN_IN_REDIRECT) : pathname;

		startTransition(async () => {
			const response = await checkUserVerification(`${data.email}`);

			setErrorMessage(response.error);
			setSuccessMessage(response.success);
			
			console.log('Transition Response :>>', response);
			
			if (!response.error) {
				if (response.verify) {
					return router.push(`/auth/verify-account?email=${data.email}`);
				}

				try {
					const callback = await signIn('credentials', {
						...data,
						redirect: false
					});
	
					if (callback?.error) throw new Error(callback.error.replace(/^Error: /, ''));
					
					if (callback?.ok) {
						form.reset();
						router.push(url);
						setSuccessMessage('Sign in successful!');
					}
				} catch (error: any) {
					console.error('Sign-In Error :>>', error);
					
					setIsDisabled(false);
					setGoogleLoading(false);
					setErrorMessage(error.message ?? 'An error occurred while signing in');
				}
			}
		});
	};

	return (
		<Form {...form}>
			<form className='flex flex-col gap-y-6' onSubmit={handleSubmit(onSubmit)}>
				{/* Email */}
				<FormField
					control={form.control}
					name='email'
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<div className='relative'>
									<label htmlFor={field.name} className='absolute -top-2.5 left-5 inline-block bg-white dark:bg-black px-1 text-base font-medium text-gray-600 dark:text-gray-300'>
										Email Address
									</label>
									<input
										type='text'
										className='block w-full rounded-md border-0 py-2 px-6 h-14 text-gray-900 dark:text-gray-200 shadow-sm bg-white dark:bg-black ring-1 ring-inset ring-gray-300 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-base'
										placeholder='Enter your email address'
										disabled={isSubmitting || isDisabled}
										id={field.name}
										autoComplete='email'
										{...field}
									/>
								</div>
							</FormControl>
							<FormMessage className='text-red-400' />
						</FormItem>
					)}
				/>

				{/* Password */}
				<FormField
					control={form.control}
					name='password'
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<div className='relative'>
									<label htmlFor={field.name} className='absolute -top-2.5 left-5 inline-block bg-white dark:bg-black px-1 text-base font-medium text-gray-600 dark:text-gray-300'>
										Password
									</label>
									<input
										type={showPassword ? 'text' : 'password'}
										className='block w-full rounded-md border-0 py-2 px-6 h-14 text-gray-900 dark:text-gray-200 shadow-sm bg-white dark:bg-black ring-1 ring-inset ring-gray-300 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-base'
										placeholder='Enter your password'
										disabled={isSubmitting || isDisabled}
										id={field.name}
										autoComplete='password'
										{...field}
									/>
									<div onClick={()=> setShowPassword(previous => !previous)} className='absolute inset-y-0 right-0 flex text-gray-400 items-center pr-4 cursor-pointer'>
										{showPassword ? <EyeOffIcon className='w-5 h-5' /> : <EyeIcon className='w-6 h-6' />}
									</div>
								</div>
							</FormControl>
							<FormMessage className='text-red-400' />
						</FormItem>
					)}
				/>

				<div className='-mt-2.5 text-base text-right'>
					<Link href={'/auth/forgot-password'} className='font-medium text-indigo-600 hover:text-indigo-500'>
						Forgot your password?
					</Link>
				</div>

				<FormError message={errorMessage} />
				<FormSuccess message={successMessage} />

				<Button type='submit' disabled={isSubmitting || isDisabled} className='h-12 relative bg-black dark:bg-core text-sm xl:text-base'>
					{isSubmitting ? (
						<Loader size={24} className='leading-[0] text-white' />
					) : (
						'Sign In'
					)}
				</Button>

				<div className='relative'>
					<div className='absolute inset-0 flex items-center'>
						<div className='w-full border-t border-gray-300' />
					</div>
					<div className='relative flex justify-center text-sm'>
						<span className='px-2 bg-white dark:bg-black'>Or, sign in with</span>
					</div>
				</div>
				
				<AuthSocialButton
					loading={googleLoading}
					text='Sign in with Google'
					icon={
						<svg className='w-6 h-6' viewBox='0 0 48 48'>
							<path fill='#FFC107' d='M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z' />
							<path fill='#FF3D00' d='M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z' />
							<path fill='#4CAF50' d='M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z' />
							<path fill='#1976D2' d='M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z' />
						</svg>
					}
					onClick={() => socialAction('google')}
				/>

				<p className='-mt-2.5 text-base text-gray-600'>
					Don&apos;t have an account?{' '}
					<Link href={'/auth/sign-up'} className='font-medium text-indigo-600 hover:text-indigo-500'>
						Get started.
					</Link>
				</p>
			</form>
		</Form>
	)
}

export default LoginForm;

import type { Metadata } from 'next';
import SignIn from '#/app/auth/sign-in/SignIn';

export const metadata: Metadata = {
	title: 'Sign In ~ Gynora',
	description: 'Sign in to your Gynora account'
};

const Page = () => {
	return <SignIn />;
};

export default Page;

import type { Metadata } from 'next';
import SignUp from '#/app/auth/sign-up/SignUp';

export const metadata: Metadata = {
	title: 'Sign Up ~ Gynora',
	description: 'Sign up for a FREE Gynora account'
};

const Page = () => {
	return <SignUp />;
};

export default Page;

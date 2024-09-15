import type { Metadata } from 'next';
import authConfig from '#/auth.config';
import { redirect } from 'next/navigation';
import { getUserDataById } from '#/lib/data/user';
import Onboarding from '#/app/onboarding/Onboarding';
import { type Session, getServerSession } from 'next-auth';

export const metadata: Metadata = {
	title: 'Onboarding ~ Gynora',
	description: 'Set up your Gynora account'
};

const Page = async () => {
	// Check if user has been onboarded...
	const { user } = await getServerSession(authConfig) as Session;
	const userData = await getUserDataById(user.id);
	const [firstName = 'there'] = (user.name?.split(' ') ?? ['there']);
	
	if (userData) redirect('/dashboard');

	return <Onboarding userId={user.id} firstName={firstName} />;
};

export default Page;

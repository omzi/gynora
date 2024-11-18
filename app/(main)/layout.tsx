import { ReactNode } from 'react';
import authConfig from '#/auth.config';
import { redirect } from 'next/navigation';
import { Session, getServerSession } from 'next-auth';
import { getUserById, getUserDataById } from '#/lib/data/user';
import { UserProvider } from '#/components/contexts/UserContext';
import Navigation from '#/components/shared/Navigation';

const MainLayout = async ({ children }: { children: ReactNode }) => {
	const session = await getServerSession(authConfig) as Session;
	const user = await getUserById(session.user.id);
	const userData = await getUserDataById(session.user.id);
	
	if (!user || !userData) redirect('/onboarding');

	return (
		<UserProvider user={user} userData={userData}>
			<Navigation>
				{children}
			</Navigation>
		</UserProvider>
	);
};

export default MainLayout;

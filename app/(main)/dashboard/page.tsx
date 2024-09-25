import type { Metadata } from 'next';
import authConfig from '#/auth.config';
import { mentalHealthTips } from '#/lib/utils';
import { getServerSession, Session } from 'next-auth';
import Dashboard from '#/app/(main)/dashboard/Dashboard';
import { getDashboardStats } from '#/lib/data/user';

export const metadata: Metadata = {
	title: 'Dashboard ~ Gynora',
	description: '...'
};

const Page = async () => {
	const session = await getServerSession(authConfig) as Session;
	
	const randomTip = mentalHealthTips[Math.floor(Math.random() * mentalHealthTips.length)];
	const data = await getDashboardStats(session.user.id);
	
	return <Dashboard randomTip={randomTip} data={data} />;
};

export default Page;

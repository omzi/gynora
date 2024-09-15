import type { Metadata } from 'next';
import History from '#/app/(main)/history/History';

export const metadata: Metadata = {
	title: 'History ~ Gynora',
	description: '...'
};

const Page = () => {
	return <History />;
};

export default Page;

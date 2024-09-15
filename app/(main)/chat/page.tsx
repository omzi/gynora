import type { Metadata } from 'next';
import Chat from '#/app/(main)/chat/Chat';

export const metadata: Metadata = {
	title: 'Chat ~ Gynora',
	description: '...'
};

const Page = () => {
	return <Chat />;
};

export default Page;

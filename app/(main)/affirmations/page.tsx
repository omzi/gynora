import type { Metadata } from 'next';
import Affirmations from '#/app/(main)/affirmations/Affirmations';

export const metadata: Metadata = {
	title: 'Affirmations ~ Gynora',
	description: '...'
};

const Page = () => {
	return <Affirmations />;
};

export default Page;

import type { Metadata } from 'next';
import authConfig from '#/auth.config';
import { parseSubtitle } from '#/lib/utils';
import { notFound, redirect } from 'next/navigation';
import { getServerSession, Session } from 'next-auth';
import AffirmationId from '#/app/(main)/affirmations/[affirmationId]/AffirmationId';
import { getAffirmationByAffirmationId, getAffirmationByUserIdAndAffirmationId } from '#/lib/data/affirmations';

export const generateMetadata = async ({ params }: PageProps) => {
	const affirmation = await getAffirmationByAffirmationId(params.affirmationId);
	if (!affirmation) {
		notFound();
	}

	return {
		title: `${affirmation.category} / Affirmations ~ Gynora`
	} as Metadata;
};

interface PageProps {
	params: {
		affirmationId: string;
	};
};

const Page = async ({ params }: PageProps) => {
	const session = await getServerSession(authConfig) as Session;

	const affirmation = await getAffirmationByUserIdAndAffirmationId(session.user.id, params.affirmationId);
	if (!affirmation) {
		redirect('/affirmations');
	}

	const subtitle = parseSubtitle(`${affirmation.subtitle}`);

	return <AffirmationId affirmation={affirmation} subtitle={subtitle} />;
};

export default Page;

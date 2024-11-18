import prisma from '#/lib/prisma';
import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export const GET = async (req: NextRequest) => {
	const token = await getToken({ req });
	if (!token) {
		return NextResponse.json({ message: 'Unauthenticated!' }, { status: 401 });
	}

	try {
		const affirmations = await prisma.affirmation.findMany({
			where: { userId: token.sub as string },
			select: {
				id: true,
				category: true,
				content: true,
				tone: true,
				createdAt: true
			}
		});

		// Format the response data
		const affirmationHistory = affirmations.map(affirmation => {
			const slicedContent = affirmation.content.slice(0, 100).padEnd(3, '.');
			return {
				...affirmation,
				content: slicedContent
			};
		});

		return NextResponse.json(affirmationHistory, { status: 200 });
	} catch (error) {
		console.error('Server Error [GET/ChatHistory]:>>', error);
		return NextResponse.json({ message: 'Error fetching affirmation history ;(' }, { status: 500 });
	}
};

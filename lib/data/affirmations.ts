import prisma from '#/lib/prisma';

export const getAffirmationCountByUserId = async (userId: string) => {
	try {
		const affirmationCount = await prisma.affirmation.count({ where: { userId } });

		return affirmationCount;
	} catch (error) {
		return 0;
	}
};

export const getAffirmationByUserIdAndAffirmationId = async (userId: string, affirmationId: string) => {
	try {
		const affirmation = await prisma.affirmation.findUnique({
			where: { userId, id: affirmationId }
		});

		return affirmation;
	} catch (error) {
		return null;
	}
};

export const getAffirmationByAffirmationId = async (affirmationId: string) => {
	try {
		const affirmation = await prisma.affirmation.findUnique({
			where: { id: affirmationId }
		});

		return affirmation;
	} catch (error) {
		return null;
	}
};


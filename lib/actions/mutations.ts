'use server';

import prisma from '#/lib/prisma';
import { Prisma } from '@prisma/client';

export const deleteChat = async (id: string) => {
	await prisma.chat.delete({ where: { id } });
};

export const renameChat = async ({ id, name }: { id: string, name: string }) => {
	if (!name) {
		throw new Error('Name is required');
	}

	if (name.length > 60) {
		throw new Error('Name cannot be longer than 60 characters');
	}

	const chat = await prisma.chat.update({
		where: { id },
		data: { name }
	});

	return chat;
};

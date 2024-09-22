'use server';

import * as z from 'zod';
import prisma from '#/lib/prisma';
import { OptionalExcept } from '#/types';
import { revalidatePath } from 'next/cache';
import { UserDataUpdateSchema } from '#/lib/validations';

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

export const saveProfile = async (data: OptionalExcept<z.infer<typeof UserDataUpdateSchema>, 'userId'>, hasImageChanged: boolean) => {
	const validatedFields = UserDataUpdateSchema.safeParse(data);
	if (!validatedFields.success) {
		return { error: 'Invalid fields!' };
	}

	const profilePicture = data.profilePicture;
	delete data.profilePicture;

	try {
		if (hasImageChanged) {
			await prisma.user.update({
				where: { id: data.userId },
				data: { image: profilePicture }
			});
		}
		
		await prisma.userData.update({
			where: { userId: data.userId },
			data
		});

		revalidatePath('/profile');

		return { success: 'Profile updated successfully!' };
	} catch (error) {
		console.log('Update User Data [Error]:>>', error);
		return { error: 'An error occurred while updating your profile' };
	}
};

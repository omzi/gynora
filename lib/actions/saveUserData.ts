'use server';

import * as z from 'zod';
import prisma from '#/lib/prisma';
import { getUserDataById } from '#/lib/data/user';
import { UserDataSchema } from '#/lib/validations';

const saveUserData = async (data: z.infer<typeof UserDataSchema>) => {
  const validatedFields = UserDataSchema.safeParse(data);
  if (!validatedFields.success) {
    return { error: 'Invalid fields!' };
  }

  console.log('User Data :>>', data);

  try {
    const userData = await getUserDataById(data.userId);
    if (userData) {
      return { error: `You've already been onboarded!` };
    }
  
    await prisma.userData.create({ data });
  
    return { success: 'Onboarding successful!' };
  } catch (error) {
    console.log('Save User Data [Error]:>>', error);
    return { error: 'An error occurred while saving your data' };
  }
};

export default saveUserData;

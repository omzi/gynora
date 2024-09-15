import prisma from '#/lib/prisma';
import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export const POST = async (req: NextRequest, res: NextResponse) => {
	const token = await getToken({ req });
	if (!token) {
		return NextResponse.json({ message: 'Unauthenticated!' }, { status: 401 });
	}

	const { message } = await req.json();
	if (!message) {
		return NextResponse.json({ message: 'Message is required' }, { status: 400 });
	}

	try {
		const chat = await prisma.chat.create({
			data: {
				userId: token.sub as string,
				name: 'Untitled Session',
				messages: {
					create: { role: 'user', content: message }
				}
			}
		});

		return NextResponse.json({ chatId: chat.id }, { status: 200 });
	} catch (error) {
		console.error('Server Error [POST/Chats]:>>', error);
		return NextResponse.json({ message: 'Error creating chat ;(' }, { status: 500 });
	}
};

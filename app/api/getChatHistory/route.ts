import prisma from '#/lib/prisma';
import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export const GET = async (req: NextRequest) => {
	const token = await getToken({ req });
	if (!token) {
		return NextResponse.json({ message: 'Unauthenticated!' }, { status: 401 });
	}

	try {
		const chats = await prisma.chat.findMany({
			where: { userId: token.sub as string },
			select: {
				id: true,
				name: true,
				updatedAt: true,
				messages: {
					orderBy: { createdAt: 'desc' },
					take: 1
				}
			},
			orderBy: { createdAt: 'desc' }
		});

		// Format the response data
		const chatHistory = chats.map(chat => {
			const [lastMessage] = chat.messages;
			return {
				id: lastMessage.chatId,
				name: chat.name,
				lastUpdated: lastMessage.createdAt,
				lastMessageContent: lastMessage.content
			};
		});

		return NextResponse.json(chatHistory, { status: 200 });
	} catch (error) {
		console.error('Server Error [GET/ChatHistory]:>>', error);
		return NextResponse.json({ message: 'Error fetching chat history ;(' }, { status: 500 });
	}
};

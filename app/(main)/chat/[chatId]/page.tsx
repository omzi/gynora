import { type Message } from 'ai';
import type { Metadata } from 'next';
import authConfig from '#/auth.config';
import { notFound, redirect } from 'next/navigation';
import { getServerSession, Session } from 'next-auth';
import ChatId from '#/app/(main)/chat/[chatId]/ChatId';
import { getChatByChatId, getChatByUserIdAndChatId, getMessagesInChatByChatId } from '#/lib/data/chats';

export const generateMetadata = async ({ params }: PageProps) => {
	const chat = await getChatByChatId(params.chatId);
	if (!chat) {
		notFound();
	}

	return {
		title: `${chat.name} / Chat ~ Gynora`
	} as Metadata;
};

interface PageProps {
	params: {
		chatId: string;
	};
};

const Page = async ({ params }: PageProps) => {
	const session = await getServerSession(authConfig) as Session;

	const chat = await getChatByUserIdAndChatId(session.user.id, params.chatId);
	if (!chat) {
		redirect('/chat');
	}

	const messages = await getMessagesInChatByChatId(chat.id) as Message[];

	return <ChatId initialMessages={messages} chatId={chat.id} />;
};

export default Page;

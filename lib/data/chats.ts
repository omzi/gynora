import prisma from '#/lib/prisma';

export const getChatCountByUserId = async (userId: string) => {
  try {
    const chatCount = await prisma.chat.count({ where: { userId } });

    return chatCount;
  } catch (error) {
    return 0;
  }
};

export const getChatsByUserId = async (userId: string) => {
  try {
    const chats = await prisma.chat.findMany({
			where: { userId },
      select: { id: true, name: true, createdAt: true },
      orderBy: { createdAt: 'asc' }
		});

    return chats;
  } catch (error) {
    return [];
  }
};

export const getChatByUserIdAndChatId = async (userId: string, chatId: string) => {
  try {
    const chat = await prisma.chat.findUnique({
      where: { userId, id: chatId }
    });

    return chat;
  } catch (error) {
    return null;
  }
};

export const getChatByChatId = async (chatId: string) => {
  try {
    const chat = await prisma.chat.findUnique({
      where: { id: chatId }
    });

    return chat;
  } catch (error) {
    return null;
  }
};

export const getMessagesInChatByChatId = async (chatId: string) => {
  try {
    const messages = await prisma.message.findMany({
      where: { chatId },
      select: { id: true, role: true, content: true, createdAt: true }
    });

    return messages;
  } catch (error) {
    return [];
  }
};

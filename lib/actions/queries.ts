import { ChatHistory, Affirmation } from '#/types';

export const getChatHistory = async (): Promise<ChatHistory[]> => {
	const response = await fetch('/api/getChatHistory');
	if (!response.ok) {
		throw new Error('Error fetching chat history');
	}

	return response.json();
};

export const getAffirmations = async (): Promise<Affirmation[]> => {
	const response = await fetch('/api/getAffirmations');
	if (!response.ok) {
		throw new Error('Error fetching affirmations');
	}

	return response.json();
};

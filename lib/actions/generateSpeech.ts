'use server'

import OpenAI from 'openai';

const openai = new OpenAI();

const generateSpeech = async (text: string): Promise<ArrayBuffer> => {
	try {
		const mp3 = await openai.audio.speech.create({
			model: 'tts-1',
			voice: 'alloy',
			input: text
		});

		const buffer = await mp3.arrayBuffer();
		return buffer;
	} catch (error) {
		console.error('OpenAI API error:', error);
		throw new Error('Failed to generate speech');
	}
};

export default generateSpeech;

import OpenAI from 'openai';
import { Voice } from '#/types';
import prisma from '#/lib/prisma';
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { getToken } from 'next-auth/jwt';
import { blobToFile } from '#/lib/utils';
import { AssemblyAI } from 'assemblyai';
import { AffirmationSchema } from '#/lib/validations';
import { NextRequest, NextResponse } from 'next/server';
import { edgestoreBackendClient } from '#/lib/edgestoreServer';

export const maxDuration = 60;
const openai = new OpenAI();
const assemblyAIClient = new AssemblyAI({
  apiKey: process.env.ASSEMBLY_AI_API_KEY!
});

export const POST = async (req: NextRequest) => {
	const token = await getToken({ req });
	if (!token) {
		return NextResponse.json({ message: 'Unauthenticated!' }, { status: 401 });
	}
	
	const body = await req.json();

	try {
		const data = AffirmationSchema.parse(body);
		const prompt = `Create a powerful, personalized, and culturally sensitive affirmation based on the following parameters:

1. Category: ${data.category}
2. Cultural background: ${data.culturalBackground ?? 'Diverse'}
3. Tone: ${data.tone}
4. Length and Structure:
	- Length: ${data.sentenceCount} sentences
	- Sentence Complexity: ${data.sentenceComplexity}
5. Perspective: First-person ("I")
6. Timeframe: ${data.timeframe}

Guidelines for creating a culturally sensitive affirmation:
- Avoid assumptions about cultural norms, values, or practices
- Use inclusive language that respects diverse backgrounds and experiences
- Be mindful of potential cultural taboos or sensitivities
- Incorporate universal human values that transcend cultural boundaries
- If referencing cultural elements, ensure they are accurate and respectful
- Consider the cultural context of concepts like success, family, or spirituality
- Avoid idioms or metaphors that may not translate well across cultures
- Be aware of different communication styles (e.g., direct vs. indirect)

General affirmation guidelines:
- Begin with a strong, positive statement
- Use present tense to reinforce current reality
- Incorporate vivid, sensory language to enhance visualization
- Include action-oriented words to promote proactivity
- Address limiting beliefs related to the chosen category
- Conclude with a statement of certainty or commitment
- Adjust sentence structure and complexity according to the specified parameters

Optional elements to consider:
- Respectful reference to cultural strengths or wisdom, if applicable
- Incorporation of gratitude or appreciation in a culturally appropriate manner
- Call to action or intention setting that respects cultural values
- Use of rhythm or cadence in longer affirmations to enhance memorability
- Incorporation of alliteration or assonance if it enhances the affirmation without compromising clarity or cultural sensitivity

Ensure the affirmation is:
- Authentic and aligned with the user's values and cultural background
- Believable and achievable within the user's cultural context
- Positive and uplifting without imposing cultural stereotypes
- Clear and concise, avoiding culturally specific jargon
- Emotionally resonant while respecting cultural norms about emotion expression
- Structured according to the specified length and sentence parameters

Sentence Complexity Explanation
1. The Simple affirmation uses short, clear sentences with straightforward language. It covers basic positive statements about self-worth, capability, and growth.
2. The Moderate affirmation introduces more varied sentence structures and richer vocabulary. It delves deeper into concepts like personal purpose, cultural heritage, and the impact on others.
3. The Complex affirmation employs sophisticated language, metaphors, and intricate ideas. It explores nuanced concepts like duality, legacy, and the interconnectedness of personal growth with universal themes.

Examples:
- Simple:
I am capable and strong. Each day, I grow more confident.

- Medium:
With each breath, I align myself with my deepest purpose. I am a wellspring of creativity, constantly evolving and growing.

- Complex:
Each challenge I encounter is a crucible for growth, transforming obstacles into stepping stones towards my highest potential. My mind is a fertile garden where innovative ideas bloom, nurtured by curiosity and watered with perseverance.

Generate an affirmation that feels personal, powerful, and tailored to the user's specific needs, goals, and cultural background, while adhering to the requested length and structure parameters. Ensure the affirmation promotes inclusivity and respect for diverse perspectives.
Separate each sentence by a newline character.`;

		const model = google('models/gemini-1.5-flash-latest', {
			safetySettings: [
				{
					category: 'HARM_CATEGORY_HARASSMENT',
					threshold: 'BLOCK_NONE'
				},
				{
					category: 'HARM_CATEGORY_HATE_SPEECH',
					threshold: 'BLOCK_NONE'
				},
				{
					category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
					threshold: 'BLOCK_NONE'
				},
				{
					category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
					threshold: 'BLOCK_NONE'
				}
			]
		});

		const { text } = await generateText({
			model,
			prompt
		});

		console.log('Generation Text :>>', text);

		// Generate audio...
		const audioResult = await openai.audio.speech.create({
			input: text,
			model: 'tts-1',
			voice: data.voice as Voice,
			response_format: 'mp3'
		});

		const audioBlob = await audioResult.blob();
		const buffer = Buffer.from(await audioBlob.arrayBuffer());
		const url = 'data:' + audioBlob.type + ';base64,' + buffer.toString('base64');
		const uploadResult = await edgestoreBackendClient.affirmationFiles.upload({
			content: { url, extension: 'mp3' }
		});

		const audioFile = await blobToFile(audioBlob, 'audio.mp3');

		const transcript = await assemblyAIClient.transcripts.transcribe({ audio: audioFile, language_code: 'en' });
		const subtitleResult = await assemblyAIClient.transcripts.subtitles(transcript.id, 'vtt');

		const affirmation = await prisma.affirmation.create({
			data: {
				...data,
				content: text,
				subtitle: subtitleResult,
				audioUrl: uploadResult.url,
				user: { connect: { userId: `${token.sub}` } }
			}
		});

		console.log('Created Affirmation :>>', affirmation);

		return NextResponse.json({ message: 'Affirmation created successfully!', data: affirmation }, { status: 201 });
	} catch (error) {
		console.error('Server Error [GET/ChatHistory]:>>', error);
		return NextResponse.json({ message: 'Failed to create affirmation ;(' }, { status: 500 });
	}
};

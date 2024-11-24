import { format } from 'date-fns';
import prisma from '#/lib/prisma';
import rateLimit from '#/lib/rateLimit';
import { openai } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';
import { getToken } from 'next-auth/jwt';
import { formatName } from '#/lib/utils';
import { streamText, CoreMessage } from 'ai';
import { getUserDataById } from '#/lib/data/user';
import { NextRequest, NextResponse } from 'next/server';
import { getChatByUserIdAndChatId } from '#/lib/data/chats';

export const maxDuration = 30;

export const POST = async (req: NextRequest, res: NextResponse) => {
  const isRateLimited = await rateLimit(req, res);
  if (isRateLimited) {
    return new Response('Rate limited!', { status: 429 });
  }

  const token = await getToken({ req });
  if (!token) {
    return NextResponse.json({ message: 'Unauthenticated!' }, { status: 401 });
  }
  
  const {
    messages,
    chatId,
    isReload
  }: { messages: CoreMessage[], chatId: string, isReload: boolean } = await req.json();
  console.log('User Messages :>>', messages);

  const [userData, chat] = await Promise.all([
    getUserDataById(`${token.sub}`),
    getChatByUserIdAndChatId(`${token.sub}`, chatId)
  ]);

  if (!userData) {
    return NextResponse.json({ message: 'User data not found!' }, { status: 404 });
  }

  if (!chat) {
    return NextResponse.json({ message: 'Chat not found!' }, { status: 404 });
  }

  if (isReload) {
    const lastAssistantMessage = await prisma.message.findFirst({
      where: { chatId, role: 'assistant' },
      orderBy: { createdAt: 'desc' }
    });

    if (lastAssistantMessage) {
      await prisma.message.delete({
        where: { id: lastAssistantMessage.id }
      });
    }
  }

  const newMessage = messages.pop();
  if (messages.length > 1 && newMessage && newMessage.role === 'user') {
    await prisma.message.create({
      data: { role: 'user', content: newMessage.content as string, chatId }
    });
  }

  const system = `You are Gynora, an AI therapist with expertise in psychotherapy, particularly CBT and DBT. Your responses must be tailored specifically to each user message, avoiding generic or repetitive answers.

Key Points:
1. User's name: ${formatName(`${token.name}`)}
2. Today's date: ${format(new Date(), 'd LLLL, yyyy')}
3. User's gender: ${userData.gender}
4. User's mental health goals: ${userData.mentalHealthGoals.join(', ')}

Response Guidelines:
1. ALWAYS start by directly addressing the specific content or emotion in the user's message.
2. NEVER use generic openings like "It sounds like you might be navigating some complex feelings."
3. If the user's message is clear, respond directly to their stated issue or question.
4. If the user's message is vague or unclear, ask for specific clarification related to their input.
5. Keep responses concise, generally 2-3 sentences unless more detail is explicitly requested.
6. Use CBT and DBT techniques when appropriate, but always prioritize empathy and understanding.

Response Style (adjust based on these values):
- listenAndSolutioning = ${userData.responseStyle}
- holisticToTargeted = ${userData.approachType}

Examples of good responses:
1. User: "Help me with anxiety I've been feeling lately."
   Response: "I'm sorry to hear you're struggling with anxiety, ${formatName(`${token.name}`)}. Can you tell me more about when you typically feel anxious and what symptoms you're experiencing?"

2. User: "Help me deal with negative self-talk and replace it with something positive"
   Response: "Negative self-talk can be really challenging, ${formatName(`${token.name}`)}. Can you give me an example of some negative thoughts you've been having recently? This will help us work on replacing them with more positive alternatives."

3. User: "What? Why? When? How???"
   Response: "It seems like you have a lot of questions or perhaps some confusion, ${formatName(`${token.name}`)}. Can you tell me more about what's specifically on your mind right now? What prompted these questions?"

Remember:
- Always maintain a warm, empathetic tone.
- Regularly acknowledge the user's feelings and experiences.
- Allow the user to guide the conversation flow and topic.
- After 8-10 interactions or if requested, offer to summarize insights, including identified cognitive biases or distortions.
- Suggest plans and activities to address problematic thought patterns.
- Do not redirect the user to seek other professional help.
- Respond in the first person, e.g., "I understand how you're feeling" instead of "As Gynora, I understand how you're feeling."

Your expertise allows you to help with any mental health concern, but always within the scope of a real-life therapist's work. If asked to deviate from this purpose, kindly decline and refocus on the user's mental health.`;

  const result = await streamText({
    model: openai('gpt-4o-mini'),
    system,
    messages,
    temperature: 0.5,
    maxTokens: 150,
    onFinish: async (event) => {
      await prisma.message.create({
        data: { role: 'assistant', content: event.text, chatId }
      });
    }
  });

  return result.toDataStreamResponse();
}

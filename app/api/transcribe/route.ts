import { AssemblyAI } from 'assemblyai';
import { getToken } from 'next-auth/jwt';
import { blobToFile } from '#/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

const assemblyAIClient = new AssemblyAI({
  apiKey: process.env.ASSEMBLY_AI_API_KEY!
});

export const POST = async (req: NextRequest) => {
  const token = await getToken({ req });
  if (!token) {
    return NextResponse.json({ message: 'Unauthenticated!' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const audioFile = await blobToFile(formData.get('audio') as Blob, 'audio.mp3');
    const transcript = await assemblyAIClient.transcripts.transcribe({
      audio: audioFile,
      language_code: 'en'
    });

    return NextResponse.json({ transcription: transcript.text }, { status: 200 });
  } catch (error) {
    console.error('Server Error [POST/Transcribe]:>>', error);
    return NextResponse.json({ message: 'Error transcribing audio' }, { status: 500 });
  }
};

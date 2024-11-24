import { AssemblyAI } from 'assemblyai';
import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

const assemblyAIClient = new AssemblyAI({
  apiKey: process.env.ASSEMBLY_AI_API_KEY!
});

export const GET = async (req: NextRequest) => {
  const token = await getToken({ req });
  if (!token) {
    return NextResponse.json({ message: 'Unauthenticated!' }, { status: 401 });
  }

  try {
    const temporaryToken = await assemblyAIClient.realtime.createTemporaryToken({ expires_in: 120 }); // 2 minutes
    
    return NextResponse.json({ token: temporaryToken }, { status: 200 });
  } catch (error) {
    console.error('Server Error [GET/AssemblyAIToken]:>>', error);
    return NextResponse.json({ message: 'Error generating temporary token' }, { status: 500 });
  }
};

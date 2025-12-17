import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Generate speech using OpenAI TTS
    const mp3 = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'alloy', // You can use: alloy, echo, fable, onyx, nova, shimmer
      input: text,
      speed: 0.9, // Slightly slower for language learning
    });

    // Convert the response to an ArrayBuffer
    const buffer = Buffer.from(await mp3.arrayBuffer());

    // Return the audio file
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error('Error generating pronunciation:', error);
    return NextResponse.json(
      { error: 'Failed to generate pronunciation' },
      { status: 500 }
    );
  }
}

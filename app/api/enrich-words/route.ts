import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { WordData } from '@/types/word';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { words } = await request.json();

    if (!words || !Array.isArray(words) || words.length === 0) {
      return NextResponse.json(
        { error: 'Please provide an array of German words' },
        { status: 400 }
      );
    }

    // Create prompt for ChatGPT
    const prompt = `You are a German language teacher. For each German word in the list below, provide detailed information in JSON format.

IMPORTANT: If the input contains an article (der, die, das), remove it and only use the noun itself in the "german" field. The article should only appear in the "gender" field.

For each word, return:
- german: the word itself (WITHOUT the article, even if provided in the input)
- spanish: Spanish translation
- wordType: one of "noun", "verb", "adjective", "adverb", "other"
- gender: for nouns only, use "der", "die", or "das", otherwise null
- plural: for nouns only, the plural form WITH the article (e.g., "die Häuser"), otherwise null
- exampleGerman: an example sentence in German using this word
- exampleSpanish: Spanish translation of the example sentence
- conjugations: for verbs only, array with present tense conjugations [ich, du, er/sie/es, wir, ihr, sie/Sie], otherwise null
- conjugationLink: for verbs, provide the link "https://conjugator.reverso.net/conjugation-german-verb-[VERB].html" (replace [VERB] with the infinitive), otherwise null
- pastTense: for verbs only, provide the perfect tense (Perfekt) forms as a string, e.g., "ich habe gegessen, du hast gegessen, er/sie/es hat gegessen", otherwise null

Words to analyze:
${words.map((w: string) => `- ${w}`).join('\n')}

Return ONLY a valid JSON array with one object per word. No additional text or explanation.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful German language teacher. Always respond with valid JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    // Parse the JSON response
    let enrichedWords: WordData[];
    try {
      // Remove markdown code blocks if present
      const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      enrichedWords = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', content);
      throw new Error('Failed to parse AI response');
    }

    return NextResponse.json({ words: enrichedWords });
  } catch (error: any) {
    console.error('Error enriching words:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to enrich words' },
      { status: 500 }
    );
  }
}

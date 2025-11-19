import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, topic, subject, grade, testSize, difficulty } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    let systemPrompt = '';
    let userPrompt = '';

    if (action === 'generate_test') {
      systemPrompt = `You are an expert educational content creator. Generate comprehensive test questions with answers for students.`;
      userPrompt = `Generate a test with ${testSize} questions on the topic "${topic}" for ${subject} (${grade} level).
Difficulty: ${difficulty}
Format: Return a JSON array of questions, each with:
- question: string
- options: array of 4 options (for multiple choice)
- correctAnswer: string
- explanation: string
- points: number (1-5 based on difficulty)
- type: "multiple_choice" or "short_answer"

Make questions engaging, educational, and appropriate for the grade level.`;
    } else if (action === 'get_resources') {
      systemPrompt = `You are an educational resource curator. Provide comprehensive study materials for students.`;
      userPrompt = `For the topic "${topic}" in ${subject} (${grade} level), provide:
1. A concise study note (300-500 words) covering key concepts
2. 5 recommended YouTube video search queries (be specific)
3. 5 important subtopics to study
4. 5 practice tips
5. Key formulas or concepts to remember

Format as JSON with keys: notes, videoSearchQueries, subtopics, tips, keyPoints`;
    } else if (action === 'generate_flashcards') {
      systemPrompt = `You are an expert at creating effective flashcards for active recall and spaced repetition learning.`;
      userPrompt = `Create 15 flashcards for the topic "${topic}" in ${subject} (${grade} level).
Each flashcard should have:
- front: A clear, concise question or prompt
- back: The answer or explanation (concise but complete)

Make flashcards that test understanding, not just memorization. Include:
- Key definitions (3-4 cards)
- Important concepts (4-5 cards)
- Application questions (3-4 cards)
- Common misconceptions (2-3 cards)

Format as JSON array with keys: front, back`;
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add credits to your workspace.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('AI gateway error');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Parse JSON from content
    let result;
    try {
      // Remove markdown code blocks if present
      let cleanContent = content.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/```\s*$/, '');
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```\s*/, '').replace(/```\s*$/, '');
      }
      
      // Try to find JSON (array or object) in the response
      const jsonMatch = cleanContent.match(/[\[{][\s\S]*[\]}]/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        result = JSON.parse(cleanContent);
      }
    } catch (e) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Failed to parse AI response');
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('Error in ai-learning function:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

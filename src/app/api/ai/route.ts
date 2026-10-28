import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { messages, userContext } = await req.json();

    const apiKey = process.env.AI_API_KEY;
    const provider = process.env.AI_PROVIDER || 'openai';
    const model = process.env.AI_MODEL || 'gpt-4o-mini';
    const baseUrl = process.env.AI_API_BASE_URL || 'https://api.openai.com/v1';

    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'AI_PROVIDER_NOT_CONFIGURED',
          message:
            'AI Provider API key is not configured. Please supply AI_API_KEY in your .env or Settings to activate live AI generation.',
        },
        { status: 503 }
      );
    }

    const systemPrompt = `You are Daymark AI, a structured personal operating system assistant.
Help the user plan their day, organize tasks, workouts, recipes, finances, and schedule.
If the user asks you to create a task, event, note, or shopping item, provide a structured JSON action block in your response.
Action block format:
ACTION_JSON:{"type":"create_task"|"create_event"|"create_note"|"add_shopping_item","payload":{...}}
Always be concise, practical, and helpful. User Context: ${JSON.stringify(userContext || {})}`;

    // Call OpenAI-compatible endpoint
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json(
        { error: 'PROVIDER_ERROR', message: `AI provider error: ${errText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message?.content || '';

    // Extract structured action if present
    let actionData = null;
    const actionMatch = assistantMessage.match(/ACTION_JSON:(.+)/);
    if (actionMatch) {
      try {
        actionData = JSON.parse(actionMatch[1].trim());
      } catch (e) {
        console.warn('Failed to parse action json:', e);
      }
    }

    const cleanContent = assistantMessage.replace(/ACTION_JSON:.+/, '').trim();

    return NextResponse.json({
      content: cleanContent,
      actionData,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: err.message || 'Unknown server error' },
      { status: 500 }
    );
  }
}

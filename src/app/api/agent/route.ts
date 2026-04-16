import { NextRequest, NextResponse } from 'next/server';

// Function to check if string is a URL
function isURL(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

// Function to perform browser task
async function performBrowserTask(query: string): Promise<string> {
  try {
    const puppeteer = require('puppeteer');

    const browser = await puppeteer.launch({
      headless: false, // Debug: visible browser
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    let result: string;

    // Parse query: if starts with "open ", extract the site
    let target = query;
    if (query.toLowerCase().startsWith('open ')) {
      target = query.slice(5).trim();
    }

    if (isURL(target) || (target.includes('.') && !target.includes(' '))) {
      // Open the URL directly
      const url = isURL(target) ? target : `https://${target}`;
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      const title = await page.title();
      result = `Opened: ${title}`;
      // Debug delay
      await new Promise(resolve => setTimeout(resolve, 15000));
    } else {
      // Perform search on Google
      await page.goto('https://www.google.com', { waitUntil: 'networkidle0' });
      await page.waitForSelector('textarea[name="q"]');
      await page.type('textarea[name="q"]', query);
      await page.keyboard.press('Enter');
      await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 });

      const results = await page.evaluate(() => {
        const snippets = Array.from(document.querySelectorAll('div.g')).slice(0, 3);
        return snippets.map(snippet => {
          const title = snippet.querySelector('h3')?.textContent || '';
          const link = snippet.querySelector('a')?.href || '';
          return `${title} - ${link}`;
        }).join('\n');
      });
      result = results;
      // Debug delay
      await new Promise(resolve => setTimeout(resolve, 15000));
    }

    await browser.close();
    return result;
  } catch (error) {
    console.error('Browser task error:', error);
    return 'Failed to perform browser action.';
  }
}

// POST handler for /api/agent
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json({ reply: 'Message is required' });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ reply: 'OpenRouter API key not configured' });
    }

    // System prompt for autonomous decision
    const systemPrompt = `You are an autonomous AI agent with tools.
You CAN open websites and perform browser actions.
NEVER say you cannot do something.
ALWAYS choose an action.

If user says "open X" where X is a website, set action to "browser" and action_input to "X".
For other browser actions, action_input should be the URL or search query.

Return ONLY valid JSON:
{
"thought": "reason",
"action": "chat" OR "browser",
"action_input": "what to do"
}`;

    // Call OpenRouter
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ reply: 'Failed to get AI response' });
    }

    const data = await response.json();
    const aiMessage = data.choices?.[0]?.message?.content;

    if (!aiMessage) {
      return NextResponse.json({ reply: 'No response from AI' });
    }

    // Parse AI response as JSON
    let parsed;
    try {
      parsed = JSON.parse(aiMessage);
    } catch (error) {
      console.log('AI message:', aiMessage);
      // Fallback to chat if invalid JSON
      return NextResponse.json({
        thought: 'AI response was not in expected format',
        reply: 'Sorry, I couldn\'t process that properly. Can you try again?',
      });
    }

    const { thought, action, action_input } = parsed;
    console.log('Parsed:', { thought, action, action_input });

    // Execute action
    if (action === 'chat') {
      return NextResponse.json({
        thought,
        reply: action_input,
      });
    } else if (action === 'browser') {
      const browserResult = await performBrowserTask(action_input);
      return NextResponse.json({
        thought,
        reply: browserResult,
      });
    } else {
      return NextResponse.json({ reply: 'Unknown action from AI' });
    }
  } catch (error) {
    console.error('Agent error:', error);
    return NextResponse.json({ reply: 'Internal server error' });
  }
}
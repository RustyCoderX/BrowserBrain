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

// Function to perform browser task (shared with agent)
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

// POST handler for /api/browser (can be called directly or by agent)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query } = body;

    if (!query) {
      return NextResponse.json({ status: 'Query is required' }, { status: 400 });
    }

    const result = await performBrowserTask(query);
    return NextResponse.json({ result });
  } catch (error) {
    return NextResponse.json({ status: 'Failed to complete browser task' }, { status: 500 });
  }
}
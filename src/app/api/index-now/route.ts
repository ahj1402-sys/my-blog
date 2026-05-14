export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from 'next/server';

interface IndexNowRequest {
  url: string;
}

interface IndexNowSubmission {
  host: string;
  key: string;
  keyLocation: string;
  urlList: string[];
}

export async function POST(request: NextRequest) {
  try {
    const { url }: IndexNowRequest = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const INDEXNOW_API_KEY = process.env.INDEXNOW_API_KEY;
    const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

    if (!INDEXNOW_API_KEY) {
      return NextResponse.json({ error: 'IndexNow API key not configured' }, { status: 500 });
    }

    if (!SITE_URL) {
      return NextResponse.json({ error: 'Site URL not configured' }, { status: 500 });
    }

    const host = new URL(SITE_URL).hostname;
    const keyLocation = `${SITE_URL}/${INDEXNOW_API_KEY}.txt`;

    const submission: IndexNowSubmission = {
      host,
      key: INDEXNOW_API_KEY,
      keyLocation,
      urlList: [url]
    };

    console.log('🔍 Submitting URL to IndexNow:', url);

    // Submit to IndexNow API endpoints
    const endpoints = [
      'https://api.indexnow.org/indexnow',
      'https://www.bing.com/indexnow',
      // Google doesn't have IndexNow support yet, but this prepares for future
    ];

    const results = [];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submission),
        });

        const result = {
          endpoint,
          status: response.status,
          success: response.ok,
          statusText: response.statusText
        };

        results.push(result);

        if (response.ok) {
          console.log(`✅ Successfully submitted to ${endpoint}`);
        } else {
          console.error(`❌ Failed to submit to ${endpoint}:`, response.status, response.statusText);
        }
      } catch (error) {
        console.error(`❌ Error submitting to ${endpoint}:`, error);
        results.push({
          endpoint,
          status: 0,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Also submit sitemap to help with indexing
    try {
      const sitemapUrl = `${SITE_URL}/sitemap.xml`;
      const sitemapSubmission: IndexNowSubmission = {
        host,
        key: INDEXNOW_API_KEY,
        keyLocation,
        urlList: [sitemapUrl]
      };

      for (const endpoint of endpoints) {
        try {
          await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(sitemapSubmission),
          });
        } catch (error) {
          // Silently fail for sitemap submission
        }
      }
    } catch (error) {
      // Silently fail for sitemap submission
    }

    const successCount = results.filter(r => r.success).length;

    return NextResponse.json({
      success: successCount > 0,
      message: `Submitted to ${successCount}/${results.length} search engines`,
      url,
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error in IndexNow submission:', error);
    return NextResponse.json({
      error: 'Failed to submit to IndexNow',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Support GET for testing
export async function GET(request: NextRequest) {
  const INDEXNOW_API_KEY = process.env.INDEXNOW_API_KEY;
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

  return NextResponse.json({
    message: 'IndexNow API endpoint is ready',
    configured: !!INDEXNOW_API_KEY && !!SITE_URL,
    keyLocation: SITE_URL ? `${SITE_URL}/${INDEXNOW_API_KEY}.txt` : null,
    timestamp: new Date().toISOString()
  });
}
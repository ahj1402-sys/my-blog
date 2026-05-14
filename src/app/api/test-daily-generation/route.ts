export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { topics } = await request.json();
    
    if (!topics || !Array.isArray(topics) || topics.length === 0) {
      return NextResponse.json({ error: 'Please provide topics array' }, { status: 400 });
    }

    // Test with a subset of topics for demo
    const testTopics = topics.slice(0, 2); // Test with 2 topics only
    
    console.log('🧪 Testing daily generation with topics:', testTopics);
    
    // Call the actual generation API
    const generateResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/generate-daily-posts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CRON_SECRET}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ testTopics, testMode: true })
    });
    
    const result = await generateResponse.json();
    
    return NextResponse.json({
      success: true,
      message: 'Test generation completed',
      result
    });
    
  } catch (error) {
    console.error('Test generation error:', error);
    return NextResponse.json({ 
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Daily generation test endpoint',
    usage: 'POST with { "topics": ["topic1", "topic2"] }',
    info: 'This endpoint tests the daily content generation system'
  });
}
export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { env } from '@/lib/env';
import { searchUnsplashImage, extractImageKeywords, getOptimizedImageUrl } from '@/lib/unsplash';

// Verify cron secret
function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const cronSecret = env.CRON_SECRET;

  if (!cronSecret) {
    console.error('CRON_SECRET not configured');
    return false;
  }

  return authHeader === `Bearer ${cronSecret}`;
}

// Trigger Vercel redeployment
async function triggerRedeploy() {
  const webhookUrl = env.REDEPLOY_WEBHOOK_URL;

  if (!webhookUrl) {
    console.error('REDEPLOY_WEBHOOK_URL not configured');
    return false;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to trigger redeploy:', error);
    return false;
  }
}

// Submit URL to IndexNow for immediate indexing
async function submitToIndexNow(url: string) {
  const SITE_URL = env.NEXT_PUBLIC_SITE_URL;

  if (!SITE_URL) {
    console.error('NEXT_PUBLIC_SITE_URL not configured');
    return false;
  }

  try {
    const indexNowUrl = `${SITE_URL}/api/index-now`;
    const response = await fetch(indexNowUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (response.ok) {
      console.log(`Successfully submitted to IndexNow: ${url}`);
      return true;
    } else {
      console.error(`Failed to submit to IndexNow: ${url}`, response.status);
      return false;
    }
  } catch (error) {
    console.error('Failed to submit to IndexNow:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify that this is a legitimate cron job request
    if (!verifyCronSecret(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Running scheduled post publication...');

    // Find all draft posts that are scheduled to be published
    const now = new Date();
    const postsToPublish = await prisma.post.findMany({
      where: {
        status: 'DRAFT',
        scheduledAt: {
          lte: now,
          not: null
        }
      }
    });

    console.log(`Found ${postsToPublish.length} posts to publish`);

    if (postsToPublish.length === 0) {
      return NextResponse.json({
        message: 'No posts to publish',
        timestamp: now.toISOString()
      });
    }

    // Update posts to published status
    const publishedPosts = [];
    const SITE_URL = env.NEXT_PUBLIC_SITE_URL;

    for (const post of postsToPublish) {
      try {
        // Unsplash 자동 썸네일: coverImage가 없거나 OG URL이면 Unsplash에서 검색
        let coverImage = post.coverImage;
        const needsThumbnail = !coverImage || coverImage.includes('/api/og?');

        if (needsThumbnail && post.title) {
          const query = extractImageKeywords(post.title);
          const image = await searchUnsplashImage(query);
          if (image) {
            coverImage = getOptimizedImageUrl(image);
            console.log(`Unsplash thumbnail assigned for: ${post.title}`);
          }
        }

        const published = await prisma.post.update({
          where: { id: post.id },
          data: {
            status: 'PUBLISHED',
            publishedAt: now,
            ...(coverImage !== post.coverImage ? { coverImage } : {}),
          }
        });
        publishedPosts.push(published);
        console.log(`Published post: ${published.title} (${published.id})`);

        // Submit to IndexNow for immediate indexing
        if (SITE_URL) {
          const postUrl = `${SITE_URL}/posts/${published.slug}`;
          await submitToIndexNow(postUrl);
        }
      } catch (error) {
        console.error(`Failed to publish post ${post.id}:`, error);
      }
    }

    // Trigger redeploy if any posts were published
    if (publishedPosts.length > 0) {
      console.log('Triggering Vercel redeploy...');
      const redeployed = await triggerRedeploy();

      if (!redeployed) {
        console.error('Failed to trigger redeploy, but posts were published');
      }

      // Trigger sitemap update
      try {
        await fetch(`${SITE_URL}/api/sitemap/update`, {
          method: 'POST',
        })
        console.log('Sitemap update triggered');
      } catch (error) {
        console.error('Failed to trigger sitemap update:', error)
      }

      // Also submit the homepage and blog index to IndexNow
      if (SITE_URL) {
        await submitToIndexNow(SITE_URL);
        await submitToIndexNow(`${SITE_URL}/posts`);
      }
    }

    return NextResponse.json({
      message: `Published ${publishedPosts.length} posts`,
      publishedPosts: publishedPosts.map(p => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        publishedAt: p.publishedAt
      })),
      timestamp: now.toISOString(),
      redeployTriggered: publishedPosts.length > 0
    });

  } catch (error) {
    console.error('Error in publish-posts handler:', error);
    return NextResponse.json({
      error: 'Failed to publish posts',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Vercel cron sends GET requests - trigger publishing
export async function GET(request: NextRequest) {
  return POST(request);
}

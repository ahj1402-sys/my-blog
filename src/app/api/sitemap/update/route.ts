export const dynamic = "force-dynamic"
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // Trigger sitemap regeneration by revalidating the path
    const sitemapUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/sitemap.xml`
    const serverSitemapUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/server-sitemap.xml`
    
    // Ping Google to notify about sitemap update
    const googlePingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`
    
    try {
      await fetch(googlePingUrl)
      console.log('Successfully pinged Google about sitemap update')
    } catch (error) {
      console.error('Failed to ping Google:', error)
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Sitemap update triggered',
      sitemapUrl,
      serverSitemapUrl
    })
  } catch (error) {
    console.error('Error updating sitemap:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update sitemap' 
    }, { status: 500 })
  }
}
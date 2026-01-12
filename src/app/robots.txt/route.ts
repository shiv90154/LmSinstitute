import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://careerpathinstitute.com';
  
  const robotsTxt = `User-agent: *
Allow: /

# Allow crawling of public pages
Allow: /blog
Allow: /courses
Allow: /books
Allow: /study-materials
Allow: /current-affairs
Allow: /mock-tests

# Disallow admin and private areas
Disallow: /admin
Disallow: /student
Disallow: /api
Disallow: /login
Disallow: /register

# Disallow search and filter URLs with parameters
Disallow: /*?*

# Allow specific static assets
Allow: /*.css
Allow: /*.js
Allow: /*.png
Allow: /*.jpg
Allow: /*.jpeg
Allow: /*.gif
Allow: /*.svg
Allow: /*.ico
Allow: /*.webp

# Sitemap location
Sitemap: ${baseUrl}/sitemap.xml

# Crawl delay (optional - be respectful to server resources)
Crawl-delay: 1`;

  return new NextResponse(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}

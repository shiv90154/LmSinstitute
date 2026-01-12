import { Metadata } from 'next';

export interface SEOData {
  title: string;
  description: string;
  keywords?: string[];
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'course' | 'product';
  category?: string;
  tags?: string[];
}

/**
 * Generate comprehensive metadata for pages
 */
export function generateMetadata(seoData: SEOData): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://careerpathinstitute.com';
  const siteName = 'Career Path Institute';
  
  const metadata: Metadata = {
    title: seoData.title,
    description: seoData.description,
    keywords: seoData.keywords?.join(', '),
    authors: seoData.author ? [{ name: seoData.author }] : [{ name: siteName }],
    
    // Open Graph
    openGraph: {
      title: seoData.title,
      description: seoData.description,
      type: seoData.type === 'article' ? 'article' : 'website',
      url: seoData.url ? `${baseUrl}${seoData.url}` : baseUrl,
      siteName,
      locale: 'en_US',
      images: seoData.image ? [
        {
          url: seoData.image,
          width: 1200,
          height: 630,
          alt: seoData.title,
        }
      ] : [
        {
          url: `${baseUrl}/og-default.jpg`,
          width: 1200,
          height: 630,
          alt: siteName,
        }
      ],
    },
    
    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: seoData.title,
      description: seoData.description,
      site: '@CareerPathInst',
      creator: '@CareerPathInst',
      images: seoData.image ? [seoData.image] : [`${baseUrl}/og-default.jpg`],
    },
    
    // Additional metadata
    alternates: {
      canonical: seoData.url ? `${baseUrl}${seoData.url}` : baseUrl,
    },
    
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };

  // Add article-specific metadata
  if (seoData.type === 'article' && seoData.publishedTime) {
    metadata.openGraph = {
      ...metadata.openGraph,
      type: 'article',
      publishedTime: seoData.publishedTime,
      modifiedTime: seoData.modifiedTime || seoData.publishedTime,
      authors: seoData.author ? [seoData.author] : [siteName],
      tags: seoData.tags,
      section: seoData.category,
    };
  }

  return metadata;
}

/**
 * Generate JSON-LD structured data for articles
 */
export function generateArticleStructuredData(data: {
  title: string;
  description: string;
  author: string;
  publishedTime: string;
  modifiedTime: string;
  image?: string;
  url: string;
  keywords?: string[];
  category?: string;
  tags?: string[];
}) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://careerpathinstitute.com';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: data.title,
    description: data.description,
    image: data.image || `${baseUrl}/og-default.jpg`,
    author: {
      '@type': 'Person',
      name: data.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Career Path Institute',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
      },
    },
    datePublished: data.publishedTime,
    dateModified: data.modifiedTime,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}${data.url}`,
    },
    keywords: data.keywords?.join(', '),
    articleSection: data.category,
    articleTag: data.tags,
    inLanguage: 'en-US',
  };
}

/**
 * Generate JSON-LD structured data for courses
 */
export function generateCourseStructuredData(data: {
  title: string;
  description: string;
  price: number;
  image?: string;
  url: string;
  instructor: string;
  duration?: string;
  category?: string;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://careerpathinstitute.com';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: data.title,
    description: data.description,
    image: data.image || `${baseUrl}/og-default.jpg`,
    provider: {
      '@type': 'Organization',
      name: 'Career Path Institute',
      url: baseUrl,
    },
    instructor: {
      '@type': 'Person',
      name: data.instructor,
    },
    offers: {
      '@type': 'Offer',
      price: data.price,
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
    },
    url: `${baseUrl}${data.url}`,
    courseMode: 'online',
    educationalLevel: 'intermediate',
    teaches: data.category,
    timeRequired: data.duration,
    inLanguage: 'en-US',
  };
}

/**
 * Generate JSON-LD structured data for organization
 */
export function generateOrganizationStructuredData() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://careerpathinstitute.com';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'Career Path Institute',
    alternateName: 'CPI',
    description: 'Leading educational institute for competitive exam preparation in Himachal Pradesh',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    image: `${baseUrl}/og-default.jpg`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Shimla',
      addressRegion: 'Himachal Pradesh',
      addressCountry: 'India',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: ['English', 'Hindi'],
    },
    sameAs: [
      // Add social media URLs here
      'https://facebook.com/careerpathinstitute',
      'https://twitter.com/careerpathinst',
      'https://instagram.com/careerpathinstitute',
    ],
    offers: {
      '@type': 'AggregateOffer',
      offerCount: '50+',
      lowPrice: '500',
      highPrice: '5000',
      priceCurrency: 'INR',
    },
  };
}

/**
 * Generate JSON-LD structured data for website
 */
export function generateWebsiteStructuredData() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://careerpathinstitute.com';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Career Path Institute',
    url: baseUrl,
    description: 'Comprehensive online learning platform for competitive exam preparation',
    publisher: {
      '@type': 'Organization',
      name: 'Career Path Institute',
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
    inLanguage: 'en-US',
  };
}

/**
 * Generate breadcrumb structured data
 */
export function generateBreadcrumbStructuredData(breadcrumbs: Array<{ name: string; url: string }>) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://careerpathinstitute.com';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: `${baseUrl}${crumb.url}`,
    })),
  };
}

/**
 * Extract and optimize keywords from content
 */
export function optimizeKeywords(content: string, title: string, maxKeywords: number = 10): string[] {
  // Combine title and content for keyword extraction
  const fullText = `${title} ${content}`.toLowerCase();
  
  // Remove HTML tags and special characters
  const cleanText = fullText.replace(/<[^>]*>/g, ' ').replace(/[^\w\s]/g, ' ');
  
  // Common stop words to exclude
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
    'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after',
    'above', 'below', 'between', 'among', 'is', 'are', 'was', 'were', 'be', 'been',
    'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those',
    'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them'
  ]);
  
  // Extract words and filter
  const words = cleanText
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word))
    .filter(word => /^[a-z]+$/.test(word)); // Only alphabetic words
  
  // Count word frequency
  const wordCount = new Map<string, number>();
  words.forEach(word => {
    wordCount.set(word, (wordCount.get(word) || 0) + 1);
  });
  
  // Sort by frequency and return top keywords
  return Array.from(wordCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxKeywords)
    .map(([word]) => word);
}

/**
 * Generate meta description from content
 */
export function generateMetaDescription(content: string, maxLength: number = 160): string {
  // Remove HTML tags
  const cleanContent = content.replace(/<[^>]*>/g, ' ');
  
  // Clean up whitespace
  const normalizedContent = cleanContent.replace(/\s+/g, ' ').trim();
  
  // Truncate to maxLength, ensuring we don't cut off mid-word
  if (normalizedContent.length <= maxLength) {
    return normalizedContent;
  }
  
  const truncated = normalizedContent.substring(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(' ');
  
  if (lastSpaceIndex > maxLength * 0.8) {
    return truncated.substring(0, lastSpaceIndex) + '...';
  }
  
  return truncated + '...';
}

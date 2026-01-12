/**
 * Content similarity algorithms for related posts recommendation
 */

export interface SimilarityScore {
  postId: string;
  score: number;
  reasons: string[];
}

/**
 * Calculate similarity between two posts based on multiple factors
 */
export function calculatePostSimilarity(
  currentPost: {
    category: string;
    tags: string[];
    title: string;
    content: string;
  },
  otherPost: {
    _id: string;
    category: string;
    tags: string[];
    title: string;
    content?: string;
  }
): SimilarityScore {
  let score = 0;
  const reasons: string[] = [];

  // Category match (highest weight)
  if (currentPost.category === otherPost.category) {
    score += 10;
    reasons.push('Same category');
  }

  // Tag similarity
  const commonTags = currentPost.tags.filter(tag => 
    otherPost.tags.includes(tag)
  );
  if (commonTags.length > 0) {
    const tagScore = Math.min(commonTags.length * 3, 9); // Max 9 points for tags
    score += tagScore;
    reasons.push(`${commonTags.length} common tags: ${commonTags.join(', ')}`);
  }

  // Title similarity (using simple word overlap)
  const titleSimilarity = calculateTextSimilarity(currentPost.title, otherPost.title);
  if (titleSimilarity > 0.2) {
    const titleScore = Math.floor(titleSimilarity * 5); // Max 5 points for title
    score += titleScore;
    reasons.push(`Title similarity: ${Math.round(titleSimilarity * 100)}%`);
  }

  // Content similarity (if available)
  if (currentPost.content && otherPost.content) {
    const contentSimilarity = calculateTextSimilarity(
      extractKeywords(currentPost.content).join(' '),
      extractKeywords(otherPost.content).join(' ')
    );
    if (contentSimilarity > 0.1) {
      const contentScore = Math.floor(contentSimilarity * 3); // Max 3 points for content
      score += contentScore;
      reasons.push(`Content similarity: ${Math.round(contentSimilarity * 100)}%`);
    }
  }

  return {
    postId: otherPost._id,
    score,
    reasons,
  };
}

/**
 * Calculate text similarity using Jaccard similarity coefficient
 */
function calculateTextSimilarity(text1: string, text2: string): number {
  const words1 = new Set(normalizeText(text1).split(/\s+/));
  const words2 = new Set(normalizeText(text2).split(/\s+/));

  const intersection = new Set(Array.from(words1).filter(word => words2.has(word)));
  const union = new Set([...Array.from(words1), ...Array.from(words2)]);

  return union.size === 0 ? 0 : intersection.size / union.size;
}

/**
 * Normalize text for comparison
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Remove punctuation
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

/**
 * Extract keywords from text content
 */
function extractKeywords(content: string, maxKeywords: number = 20): string[] {
  // Remove HTML tags
  const cleanContent = content.replace(/<[^>]*>/g, ' ');
  
  // Normalize text
  const normalizedContent = normalizeText(cleanContent);
  
  // Common stop words to exclude
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
    'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after',
    'above', 'below', 'between', 'among', 'is', 'are', 'was', 'were', 'be', 'been',
    'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those',
    'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them'
  ]);

  // Extract and filter words
  const words = normalizedContent
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word))
    .filter(word => /^[a-z]+$/.test(word)); // Only alphabetic words

  // Count word frequency
  const wordCount = new Map<string, number>();
  words.forEach(word => {
    wordCount.set(word, (wordCount.get(word) || 0) + 1);
  });

  // Return top keywords by frequency
  return Array.from(wordCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxKeywords)
    .map(([word]) => word);
}

/**
 * Get related posts using multiple similarity algorithms
 */
export function getRelatedPostsScores(
  currentPost: {
    category: string;
    tags: string[];
    title: string;
    content: string;
  },
  candidatePosts: Array<{
    _id: string;
    category: string;
    tags: string[];
    title: string;
    content?: string;
    createdAt: Date;
  }>,
  maxResults: number = 5
): SimilarityScore[] {
  // Calculate similarity scores for all candidate posts
  const scores = candidatePosts.map(post => 
    calculatePostSimilarity(currentPost, post)
  );

  // Sort by score (descending) and then by recency
  const sortedScores = scores.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    
    // If scores are equal, prefer more recent posts
    const postA = candidatePosts.find(p => p._id === a.postId);
    const postB = candidatePosts.find(p => p._id === b.postId);
    
    if (postA && postB) {
      return postB.createdAt.getTime() - postA.createdAt.getTime();
    }
    
    return 0;
  });

  // Return top results with minimum score threshold
  return sortedScores
    .filter(score => score.score > 0)
    .slice(0, maxResults);
}

/**
 * Generate recommendation reasons for display
 */
export function generateRecommendationReason(similarity: SimilarityScore): string {
  if (similarity.reasons.length === 0) {
    return 'Related content';
  }

  if (similarity.reasons.length === 1) {
    return similarity.reasons[0];
  }

  if (similarity.reasons.length === 2) {
    return similarity.reasons.join(' and ');
  }

  return `${similarity.reasons.slice(0, -1).join(', ')}, and ${similarity.reasons[similarity.reasons.length - 1]}`;
}

/**
 * Category-based fallback recommendations
 */
export function getCategoryBasedRecommendations(
  category: string,
  excludePostId: string,
  candidatePosts: Array<{
    _id: string;
    category: string;
    createdAt: Date;
  }>,
  maxResults: number = 3
): string[] {
  return candidatePosts
    .filter(post => post.category === category && post._id !== excludePostId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, maxResults)
    .map(post => post._id);
}

/**
 * Recent posts fallback recommendations
 */
export function getRecentPostsRecommendations(
  excludePostId: string,
  candidatePosts: Array<{
    _id: string;
    createdAt: Date;
  }>,
  maxResults: number = 3
): string[] {
  return candidatePosts
    .filter(post => post._id !== excludePostId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, maxResults)
    .map(post => post._id);
}

import mongoose from 'mongoose';

// Use a generic filter type instead of FilterQuery
type FilterQuery<T> = Record<string, any>;

// Interface for search parameters
export interface SearchParams {
  search?: string;
  category?: string;
  tags?: string;
  startDate?: string;
  endDate?: string;
  month?: string;
  year?: string;
  type?: string;
  subject?: string;
  minPrice?: string;
  maxPrice?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: string;
  limit?: string;
}

// Interface for pagination info
export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Build search filter for current affairs
export function buildCurrentAffairsFilter(searchParams: SearchParams): FilterQuery<any> {
  const filter: FilterQuery<any> = { isActive: true };

  // Search functionality
  if (searchParams.search) {
    filter.$or = [
      { title: { $regex: searchParams.search, $options: 'i' } },
      { summary: { $regex: searchParams.search, $options: 'i' } },
      { content: { $regex: searchParams.search, $options: 'i' } },
      { tags: { $in: [new RegExp(searchParams.search, 'i')] } },
    ];
  }

  // Filter by category
  if (searchParams.category) {
    filter.category = { $regex: searchParams.category, $options: 'i' };
  }

  // Filter by date range
  if (searchParams.startDate || searchParams.endDate) {
    filter.date = {};
    if (searchParams.startDate) filter.date.$gte = new Date(searchParams.startDate);
    if (searchParams.endDate) filter.date.$lte = new Date(searchParams.endDate);
  }

  // Filter by month and year
  if (searchParams.month) {
    filter.month = parseInt(searchParams.month);
  }
  if (searchParams.year) {
    filter.year = parseInt(searchParams.year);
  }

  // Filter by tags
  if (searchParams.tags) {
    const tagArray = searchParams.tags.split(',').map(tag => tag.trim());
    filter.tags = { $in: tagArray.map(tag => new RegExp(tag, 'i')) };
  }

  return filter;
}

// Build search filter for study materials
export function buildStudyMaterialFilter(searchParams: SearchParams): FilterQuery<any> {
  const filter: FilterQuery<any> = { isActive: true };

  // Search functionality
  if (searchParams.search) {
    filter.$or = [
      { title: { $regex: searchParams.search, $options: 'i' } },
      { description: { $regex: searchParams.search, $options: 'i' } },
      { tags: { $in: [new RegExp(searchParams.search, 'i')] } },
    ];
  }

  // Filter by type
  if (searchParams.type) {
    filter.type = searchParams.type;
  }

  // Filter by category
  if (searchParams.category) {
    filter.category = { $regex: searchParams.category, $options: 'i' };
  }

  // Filter by subject
  if (searchParams.subject) {
    filter.subject = { $regex: searchParams.subject, $options: 'i' };
  }

  // Filter by year
  if (searchParams.year) {
    filter.year = parseInt(searchParams.year);
  }

  // Filter by price range
  if (searchParams.minPrice || searchParams.maxPrice) {
    filter.price = {};
    if (searchParams.minPrice) filter.price.$gte = parseFloat(searchParams.minPrice);
    if (searchParams.maxPrice) filter.price.$lte = parseFloat(searchParams.maxPrice);
  }

  return filter;
}

// Build sort object
export function buildSortObject(sortBy: string = 'createdAt', sortOrder: string = 'desc'): Record<string, 1 | -1> {
  const sort: Record<string, 1 | -1> = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
  return sort;
}

// Calculate pagination info
export function calculatePagination(
  page: number,
  limit: number,
  total: number
): PaginationInfo {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    currentPage: page,
    totalPages,
    totalItems: total,
    itemsPerPage: limit,
    hasNextPage,
    hasPrevPage,
  };
}

// Parse pagination parameters
export function parsePaginationParams(searchParams: SearchParams): { page: number; limit: number; skip: number } {
  const page = parseInt(searchParams.page || '1');
  const limit = Math.min(parseInt(searchParams.limit || '10'), 50); // Max 50 items per page
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

// Validate search parameters
export function validateSearchParams(searchParams: SearchParams): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate page
  if (searchParams.page && (isNaN(parseInt(searchParams.page)) || parseInt(searchParams.page) < 1)) {
    errors.push('Page must be a positive integer');
  }

  // Validate limit
  if (searchParams.limit && (isNaN(parseInt(searchParams.limit)) || parseInt(searchParams.limit) < 1 || parseInt(searchParams.limit) > 50)) {
    errors.push('Limit must be between 1 and 50');
  }

  // Validate dates
  if (searchParams.startDate && isNaN(Date.parse(searchParams.startDate))) {
    errors.push('Start date must be a valid date');
  }

  if (searchParams.endDate && isNaN(Date.parse(searchParams.endDate))) {
    errors.push('End date must be a valid date');
  }

  // Validate month
  if (searchParams.month && (isNaN(parseInt(searchParams.month)) || parseInt(searchParams.month) < 1 || parseInt(searchParams.month) > 12)) {
    errors.push('Month must be between 1 and 12');
  }

  // Validate year
  if (searchParams.year && (isNaN(parseInt(searchParams.year)) || parseInt(searchParams.year) < 2000 || parseInt(searchParams.year) > new Date().getFullYear() + 1)) {
    errors.push('Year must be between 2000 and next year');
  }

  // Validate prices
  if (searchParams.minPrice && (isNaN(parseFloat(searchParams.minPrice)) || parseFloat(searchParams.minPrice) < 0)) {
    errors.push('Minimum price must be a non-negative number');
  }

  if (searchParams.maxPrice && (isNaN(parseFloat(searchParams.maxPrice)) || parseFloat(searchParams.maxPrice) < 0)) {
    errors.push('Maximum price must be a non-negative number');
  }

  if (searchParams.minPrice && searchParams.maxPrice && parseFloat(searchParams.minPrice) > parseFloat(searchParams.maxPrice)) {
    errors.push('Minimum price cannot be greater than maximum price');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Get available filter options for current affairs
export async function getCurrentAffairsFilterOptions() {
  const CurrentAffairs = (await import('@/models/CurrentAffairs')).default;
  
  const [categories, years, tags] = await Promise.all([
    CurrentAffairs.distinct('category', { isActive: true }),
    CurrentAffairs.distinct('year', { isActive: true }),
    CurrentAffairs.distinct('tags', { isActive: true }),
  ]);

  return {
    categories: categories.sort(),
    years: years.sort((a: number, b: number) => b - a),
    tags: tags.filter(tag => tag && tag.trim()).sort(),
  };
}

// Get available filter options for study materials
export async function getStudyMaterialFilterOptions() {
  const StudyMaterial = (await import('@/models/StudyMaterial')).default;
  
  const [types, categories, subjects, years] = await Promise.all([
    StudyMaterial.distinct('type', { isActive: true }),
    StudyMaterial.distinct('category', { isActive: true }),
    StudyMaterial.distinct('subject', { isActive: true }),
    StudyMaterial.distinct('year', { isActive: true }),
  ]);

  return {
    types: types.sort(),
    categories: categories.sort(),
    subjects: subjects.filter(subject => subject && subject.trim()).sort(),
    years: years.filter(year => year).sort((a: number, b: number) => b - a),
  };
}

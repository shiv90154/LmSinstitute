import User from '@/models/User';
import Course from '@/models/Course';
import { IOrder } from '@/models/Order';

export interface ContentUnlockResult {
  success: boolean;
  unlockedItems: Array<{
    type: string;
    itemId: string;
    title: string;
  }>;
  errors: Array<{
    type: string;
    itemId: string;
    error: string;
  }>;
}

/**
 * Unlock content for user based on successful payment
 */
export async function unlockContentForUser(
  userId: string,
  order: IOrder
): Promise<ContentUnlockResult> {
  const result: ContentUnlockResult = {
    success: true,
    unlockedItems: [],
    errors: [],
  };

  try {
    // Get user document
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Initialize purchases array if it doesn't exist
    if (!user.purchases) {
      user.purchases = [];
    }

    // Add order to user's purchases if not already present
    if (!user.purchases.includes(order._id)) {
      user.purchases.push(order._id);
    }

    // Process each item in the order
    for (const item of order.items) {
      try {
        await unlockSingleItem(userId, item.type, item.itemId.toString(), item.title);
        result.unlockedItems.push({
          type: item.type,
          itemId: item.itemId.toString(),
          title: item.title,
        });
      } catch (error) {
        result.errors.push({
          type: item.type,
          itemId: item.itemId.toString(),
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        result.success = false;
      }
    }

    // Save user with updated purchases
    await user.save();

    return result;
  } catch (error) {
    console.error('Error unlocking content for user:', error);
    return {
      success: false,
      unlockedItems: [],
      errors: [{
        type: 'general',
        itemId: 'all',
        error: error instanceof Error ? error.message : 'Failed to unlock content',
      }],
    };
  }
}

/**
 * Unlock a single item for the user
 */
async function unlockSingleItem(
  userId: string,
  itemType: string,
  itemId: string,
  itemTitle: string
): Promise<void> {
  switch (itemType) {
    case 'course':
      await unlockCourse(userId, itemId);
      break;
    case 'book':
      await unlockBook(userId, itemId);
      break;
    case 'material':
      await unlockMaterial(userId, itemId);
      break;
    case 'test':
      await unlockTest(userId, itemId);
      break;
    default:
      throw new Error(`Unknown item type: ${itemType}`);
  }
}

/**
 * Unlock course access for user
 */
async function unlockCourse(userId: string, courseId: string): Promise<void> {
  // Verify course exists
  const course = await Course.findById(courseId);
  if (!course) {
    throw new Error(`Course not found: ${courseId}`);
  }

  // Course access is managed through user's purchases
  // The actual access control is handled in the access control middleware
  // This function mainly validates that the course exists
}

/**
 * Unlock book access for user
 */
async function unlockBook(userId: string, bookId: string): Promise<void> {
  // For now, book access is managed through user's purchases
  // In the future, this could involve updating a separate books collection
  // or managing book-specific access controls
}

/**
 * Unlock study material access for user
 */
async function unlockMaterial(userId: string, materialId: string): Promise<void> {
  // Similar to books, material access is managed through user's purchases
  // This could be extended to handle specific material access controls
}

/**
 * Unlock test access for user
 */
async function unlockTest(userId: string, testId: string): Promise<void> {
  // Test access is managed through user's purchases
  // This could be extended to handle test-specific access controls
  // such as attempt limits or time-based access
}

/**
 * Check if user has access to specific content
 */
export async function checkUserAccess(
  userId: string,
  itemType: string,
  itemId: string
): Promise<boolean> {
  try {
    const user = await User.findById(userId).populate('purchases');
    if (!user || !user.purchases) {
      return false;
    }

    // Check if user has purchased any order containing this item
    for (const purchase of user.purchases) {
      if (purchase && typeof purchase === 'object' && 'items' in purchase) {
        const order = purchase as any;
        const hasItem = order.items?.some((item: any) => 
          item.type === itemType && 
          item.itemId.toString() === itemId &&
          order.status === 'completed'
        );
        if (hasItem) {
          return true;
        }
      }
    }

    return false;
  } catch (error) {
    console.error('Error checking user access:', error);
    return false;
  }
}

/**
 * Get all unlocked content for a user
 */
export async function getUserUnlockedContent(userId: string): Promise<{
  courses: string[];
  books: string[];
  materials: string[];
  tests: string[];
}> {
  const result = {
    courses: [] as string[],
    books: [] as string[],
    materials: [] as string[],
    tests: [] as string[],
  };

  try {
    const user = await User.findById(userId).populate('purchases');
    if (!user || !user.purchases) {
      return result;
    }

    // Collect all purchased items from completed orders
    for (const purchase of user.purchases) {
      if (purchase && typeof purchase === 'object' && 'items' in purchase) {
        const order = purchase as any;
        if (order.status === 'completed' && order.items) {
          for (const item of order.items) {
            const itemId = item.itemId.toString();
            switch (item.type) {
              case 'course':
                if (!result.courses.includes(itemId)) {
                  result.courses.push(itemId);
                }
                break;
              case 'book':
                if (!result.books.includes(itemId)) {
                  result.books.push(itemId);
                }
                break;
              case 'material':
                if (!result.materials.includes(itemId)) {
                  result.materials.push(itemId);
                }
                break;
              case 'test':
                if (!result.tests.includes(itemId)) {
                  result.tests.push(itemId);
                }
                break;
            }
          }
        }
      }
    }

    return result;
  } catch (error) {
    console.error('Error getting user unlocked content:', error);
    return result;
  }
}

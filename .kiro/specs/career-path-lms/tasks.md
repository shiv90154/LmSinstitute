# Implementation Plan: Career Path Institute LMS

## Overview

This implementation plan breaks down the Career Path Institute LMS into discrete coding tasks that build incrementally. The approach focuses on establishing core infrastructure first, then implementing major features with their associated testing, and finally integrating everything into a cohesive platform.

## Tasks

- [x] 1. Project Setup and Core Infrastructure
  - Initialize Next.js 14 project with TypeScript and App Router
  - Configure Tailwind CSS v4 with custom theme variables
  - Set up MongoDB Atlas connection with Mongoose
  - Configure essential ShadCN UI components
  - Set up project folder structure as specified in design
  - _Requirements: 8.1, 10.1, 10.4_

- [x] 1.1 Write property test for project configuration
  - **Property 27: Theme Customization**
  - **Validates: Requirements 10.1, 10.5**

- [x] 2. Authentication System Implementation
  - [x] 2.1 Set up NextAuth.js with JWT strategy and credential provider
    - Configure NextAuth with MongoDB adapter
    - Implement JWT token generation and validation
    - Create login and registration API routes
    - _Requirements: 1.1, 1.2, 1.3_

  - [x] 2.2 Write property test for user registration and authentication
    - **Property 1: User Registration and Authentication Flow**
    - **Validates: Requirements 1.1, 1.2**

  - [x] 2.3 Implement automatic token refresh mechanism
    - Create token refresh logic in middleware
    - Handle token expiration gracefully
    - _Requirements: 1.5_

  - [x] 2.4 Write property test for JWT token validation
    - **Property 2: JWT Token Validation**
    - **Validates: Requirements 1.3**

  - [x] 2.5 Write property test for automatic token refresh
    - **Property 3: Automatic Token Refresh**
    - **Validates: Requirements 1.5**

- [x] 3. Database Models and Schemas
  - [x] 3.1 Create User model with Mongoose schema
    - Implement user registration and profile management
    - Add role-based access control (student/admin)
    - _Requirements: 1.1, 1.6_

  - [x] 3.2 Create Course and Section models
    - Implement dynamic course structure with sections
    - Add video, material, and quiz associations
    - _Requirements: 2.1, 2.2, 2.6_

  - [x] 3.3 Create Order and Payment models
    - Implement order tracking and payment processing
    - Add Razorpay integration fields
    - _Requirements: 3.3, 3.4, 3.5_

  - [x] 3.4 Create MockTest and TestAttempt models
    - Implement test structure with sections and questions
    - Add attempt tracking and scoring
    - _Requirements: 4.1, 4.3, 4.5_

  - [x] 3.5 Create BlogPost model
    - Implement blog structure with SEO fields
    - Add category and tag support
    - _Requirements: 7.1, 7.3_

  - [x] 3.6 Write property test for data validation and storage
    - **Property 25: Data Validation and Storage**
    - **Validates: Requirements 9.1, 9.2**

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Course Management System
  - [x] 5.1 Implement course creation and management APIs
    - Create CRUD operations for courses and sections
    - Implement content organization by sections
    - _Requirements: 2.1, 2.2, 6.1, 6.2_

  - [x] 5.2 Write property test for dynamic content organization
    - **Property 12: Dynamic Content Organization**
    - **Validates: Requirements 2.2, 4.6, 5.4**

  - [x] 5.3 Implement video protection system
    - Create YouTube iframe embedding with security measures
    - Disable right-click and mask YouTube branding
    - Implement source obfuscation
    - _Requirements: 2.3, 2.7_

  - [x] 5.4 Write property test for video protection implementation
    - **Property 6: Video Protection Implementation**
    - **Validates: Requirements 2.3, 2.7**

  - [x] 5.5 Implement free content access control
    - Ensure one free video per section
    - Lock premium content behind purchase
    - _Requirements: 2.4_

  - [x] 5.6 Write property test for free content access
    - **Property 5: Free Content Access**
    - **Validates: Requirements 2.4**

  - [x] 5.7 Implement progress tracking system
    - Track student content interaction and completion
    - Store and display progress accurately
    - _Requirements: 2.5_

  - [x] 5.8 Write property test for progress tracking accuracy
    - **Property 14: Progress Tracking Accuracy**
    - **Validates: Requirements 2.5**

- [x] 6. Payment and Ecommerce System
  - [x] 6.1 Implement Razorpay integration
    - Set up order creation and payment processing
    - Implement webhook verification with cryptographic signatures
    - _Requirements: 3.3, 3.4_

  - [x] 6.2 Implement shopping cart functionality
    - Create cart state management with session persistence
    - Calculate totals and handle cart operations
    - _Requirements: 3.2_

  - [x] 6.3 Write property test for cart state management
    - **Property 8: Cart State Management**
    - **Validates: Requirements 3.2**

  - [x] 6.4 Implement complete payment flow
    - Handle successful payments with content unlocking
    - Manage payment failures with error handling
    - Generate invoices automatically
    - _Requirements: 3.4, 3.5, 3.6_

  - [x] 6.5 Write property test for complete payment flow
    - **Property 7: Complete Payment Flow**
    - **Validates: Requirements 3.3, 3.4, 3.5, 3.6**

  - [x] 6.6 Write property test for purchase-based content unlocking
    - **Property 4: Purchase-based Content Unlocking**
    - **Validates: Requirements 2.1, 5.2**

- [x] 7. Mock Testing System
  - [x] 7.1 Implement test creation and management
    - Create test structure with sections and questions
    - Implement question randomization
    - _Requirements: 4.2, 4.6_

  - [x] 7.2 Write property test for question randomization
    - **Property 10: Question Randomization**
    - **Validates: Requirements 4.2**

  - [x] 7.3 Implement test timer and auto-submission
    - Create countdown timer with automatic submission
    - Handle test completion and scoring
    - _Requirements: 4.1, 4.3_

  - [x] 7.4 Write property test for mock test timer and submission
    - **Property 9: Mock Test Timer and Submission**
    - **Validates: Requirements 4.1**

  - [x] 7.5 Implement scoring and analytics system
    - Calculate scores and generate performance analytics
    - Implement ranking system and attempt tracking
    - _Requirements: 4.3, 4.4, 4.5_

  - [x] 7.6 Write property test for score calculation and analytics
    - **Property 11: Score Calculation and Analytics**
    - **Validates: Requirements 4.3, 4.4, 4.5**

- [x] 8. Student Dashboard Implementation
  - [x] 8.1 Create student dashboard with purchased content display
    - Display courses, books, study materials, and test history
    - Implement profile management capabilities
    - _Requirements: 1.4, 1.6_

  - [x] 8.2 Write property test for user dashboard data display
    - **Property 15: User Dashboard Data Display**
    - **Validates: Requirements 1.4, 1.6**

- [ ] 9. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [-] 10. Admin Panel Implementation
  - [x] 10.1 Create comprehensive admin management interfaces
    - Implement CRUD operations for all content types
    - Create user and order management systems
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [x] 10.2 Write property test for comprehensive admin controls
    - **Property 16: Comprehensive Admin Controls**
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.4**

  - [x] 10.3 Implement analytics dashboard and payment tracking
    - Create charts and metrics for platform performance
    - Display transaction details and payment information
    - _Requirements: 6.5, 6.6_

  - [x] 10.4 Write property test for analytics and payment tracking
    - **Property 17: Analytics and Payment Tracking**
    - **Validates: Requirements 6.5, 6.6**

- [-] 11. Content Management Features
  - [x] 11.1 Implement study materials and current affairs system
    - Create content organization by time periods
    - Implement search and filter capabilities
    - _Requirements: 5.1, 5.3, 5.4_

  - [x] 11.2 Write property test for search and filter functionality
    - **Property 19: Search and Filter Functionality**
    - **Validates: Requirements 5.3**

  - [x] 11.3 Implement rich text content editor
    - Create editor for blog posts and current affairs
    - Ensure proper content storage and display
    - _Requirements: 5.6, 7.4_

  - [x] 11.4 Write property test for rich text content handling
    - **Property 18: Rich Text Content Handling**
    - **Validates: Requirements 5.6, 7.4**

  - [x] 11.5 Implement bundle system for current affairs
    - Create monthly and yearly packages
    - Integrate with Razorpay payment system
    - _Requirements: 5.5_

- [x] 12. Blog and SEO Implementation
  - [x] 12.1 Create blog system with SEO optimization
    - Implement article organization by categories
    - Generate dynamic slug-based URLs
    - _Requirements: 7.1, 7.3_

  - [x] 12.2 Write property test for dynamic URL generation
    - **Property 21: Dynamic URL Generation**
    - **Validates: Requirements 7.3**

  - [x] 12.3 Implement SEO optimization features
    - Generate meta tags and structured data
    - Create sitemap.xml and robots.txt
    - _Requirements: 7.2, 8.6_

  - [x] 12.4 Write property test for SEO optimization implementation
    - **Property 20: SEO Optimization Implementation**
    - **Validates: Requirements 7.1, 7.2, 8.6**

  - [x] 12.5 Implement related posts recommendation system
    - Create content similarity algorithms
    - Display related posts based on categories and tags
    - _Requirements: 7.5_

  - [x] 12.6 Write property test for related content recommendations
    - **Property 22: Related Content Recommendations**
    - **Validates: Requirements 7.5**

- [x] 13. Security and Error Handling
  - [x] 13.1 Implement route protection and middleware validation
    - Create authentication middleware for protected routes
    - Implement server-side payment validation
    - _Requirements: 8.2, 8.4_

  - [x] 13.2 Write property test for route protection and security
    - **Property 23: Route Protection and Security**
    - **Validates: Requirements 8.2, 8.4**

  - [x] 13.3 Implement global error handling system
    - Create custom 404 and 500 error pages
    - Implement React Error Boundaries
    - Add comprehensive error recovery mechanisms
    - _Requirements: 8.5_

  - [x] 13.4 Write property test for error handling and recovery
    - **Property 24: Error Handling and Recovery**
    - **Validates: Requirements 8.5**

- [x] 14. API Response Formatting and Content Delivery
  - [x] 14.1 Implement API response standardization
    - Ensure all endpoints return properly formatted responses
    - Implement content delivery completeness
    - _Requirements: 9.3, 2.6_

  - [x] 14.2 Write property test for API response formatting
    - **Property 26: API Response Formatting**
    - **Validates: Requirements 9.3**

  - [x] 14.3 Write property test for content delivery completeness
    - **Property 13: Content Delivery Completeness**
    - **Validates: Requirements 2.6**

- [x] 15. UI and Responsive Design Implementation
  - [x] 15.1 Implement responsive design across all components
    - Ensure mobile-first approach with proper viewport handling
    - Test component rendering across different screen sizes
    - _Requirements: 10.2_

  - [x] 15.2 Write property test for responsive design implementation
    - **Property 28: Responsive Design Implementation**
    - **Validates: Requirements 10.2**

  - [x] 15.3 Verify component library usage compliance
    - Ensure only essential ShadCN components are used
    - Remove any unnecessary library dependencies
    - _Requirements: 10.4_

  - [x] 15.4 Write property test for component library usage
    - **Property 29: Component Library Usage**
    - **Validates: Requirements 10.4**

- [x] 16. Final Integration and Testing
  - [x] 16.1 Integrate all components and features
    - Wire together authentication, payments, content delivery, and admin systems
    - Ensure seamless user experience across all features
    - _Requirements: All requirements integration_

  - [x] 16.2 Performance optimization and caching implementation
    - Implement client and server-side caching
    - Optimize for Lighthouse scores of 90+
    - _Requirements: 8.1, 8.3_

  - [x] 16.3 Final security audit and testing
    - Verify all security measures are properly implemented
    - Test payment processing and webhook verification
    - Ensure video protection is working correctly
    - _Requirements: 8.2, 8.4_

- [x] 17. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation throughout development
- Property tests validate universal correctness properties using fast-check library
- Unit tests validate specific examples and edge cases
- The implementation follows a mobile-first, responsive design approach
- All payment processing includes proper webhook verification and security measures
- Video protection measures prevent easy downloading and source identification
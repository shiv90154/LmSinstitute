# Requirements Document

## Introduction

The Career Path Institute LMS is a comprehensive learning management system with integrated ecommerce and testing capabilities. The system serves students preparing for competitive exams (specifically Patwari Exam) with courses, study materials, mock tests, and current affairs content. The platform includes payment processing, video protection, and administrative controls for a Shimla-based educational institute.

## Glossary

- **LMS**: Learning Management System - the core platform for course delivery
- **Student**: End user who purchases and consumes educational content
- **Admin**: Administrative user with full system management capabilities
- **Course**: Educational content organized into sections with videos, PDFs, and quizzes
- **Section**: Subdivision of a course containing related learning materials
- **Mock_Test**: Timed examination simulation with MCQs and performance analytics
- **Bundle**: Collection of related study materials sold as a package
- **Current_Affairs**: Daily updated content covering recent events and news
- **Video_Protection**: Security measures preventing unauthorized video access or download
- **Payment_Gateway**: Razorpay integration for processing transactions
- **JWT**: JSON Web Token for secure user authentication

## Requirements

### Requirement 1: Student Authentication and Dashboard

**User Story:** As a student, I want to create an account and access my personalized dashboard, so that I can manage my learning progress and purchases.

#### Acceptance Criteria

1. WHEN a student provides valid email and password, THE Authentication_System SHALL create a new account and generate JWT tokens
2. WHEN a student logs in with correct credentials, THE Authentication_System SHALL authenticate them and redirect to dashboard
3. WHEN a student accesses protected content, THE Authentication_System SHALL verify JWT token validity
4. THE Student_Dashboard SHALL display purchased courses, books, study materials, test history, and payment records
5. WHEN JWT tokens expire, THE Authentication_System SHALL refresh tokens automatically without user interruption
6. THE Student_Dashboard SHALL provide profile management capabilities for updating personal information

### Requirement 2: Course Management and Content Delivery

**User Story:** As a student, I want to access structured course content with protected videos, so that I can learn systematically while ensuring content security.

#### Acceptance Criteria

1. WHEN a student purchases a course, THE Course_System SHALL unlock all course sections and content
2. THE Course_System SHALL organize content into dynamic sections (General Studies, Himachal GK, English, Hindi, Current Affairs, Mathematics, Reasoning, Computer)
3. WHEN displaying videos, THE Video_Protection_System SHALL embed YouTube content with masked iframes and disabled right-click
4. THE Course_System SHALL provide one free sample video per section for preview
5. WHEN a student accesses course content, THE Progress_Tracker SHALL record and display completion status
6. THE Course_System SHALL deliver PDFs, notes, and quizzes alongside video content
7. THE Video_Protection_System SHALL prevent users from identifying YouTube as the video source

### Requirement 3: Ecommerce and Payment Processing

**User Story:** As a student, I want to purchase books and study materials through a secure payment system, so that I can access additional learning resources.

#### Acceptance Criteria

1. THE Ecommerce_System SHALL display books with detailed product pages and pricing
2. WHEN a student adds items to cart, THE Cart_System SHALL maintain session state and calculate totals
3. WHEN a student initiates checkout, THE Payment_Gateway SHALL process payments through Razorpay
4. WHEN payment is successful, THE Order_System SHALL store transaction records and unlock purchased content
5. THE Invoice_System SHALL automatically generate invoices for completed purchases
6. WHEN payment fails, THE Payment_System SHALL maintain cart state and display appropriate error messages

### Requirement 4: Mock Testing System

**User Story:** As a student, I want to take timed mock tests that simulate real exam conditions, so that I can assess my preparation and improve performance.

#### Acceptance Criteria

1. THE Mock_Test_System SHALL provide timer functionality with automatic submission at time expiry
2. THE Test_Engine SHALL present MCQs with shuffled options to prevent cheating
3. WHEN a test is completed, THE Result_Calculator SHALL compute scores and generate performance analytics
4. THE Ranking_System SHALL calculate and display student rankings based on test performance
5. THE Test_History SHALL track all previous attempts with detailed performance metrics
6. THE Mock_Test_System SHALL organize questions into sections matching exam patterns

### Requirement 5: Study Materials and Current Affairs

**User Story:** As a student, I want access to study materials and daily current affairs, so that I can supplement my course learning with additional resources.

#### Acceptance Criteria

1. THE Study_Material_System SHALL provide previous year papers and study bundles as paid content
2. WHEN payment is confirmed, THE Access_Control_System SHALL automatically unlock purchased materials
3. THE Current_Affairs_System SHALL display daily cards with search and filter capabilities
4. THE Current_Affairs_System SHALL organize content by month and year for easy navigation
5. THE Bundle_System SHALL offer monthly and yearly current affairs packages through Razorpay
6. THE Content_Management_System SHALL support rich text editing for current affairs uploads

### Requirement 6: Administrative Management

**User Story:** As an admin, I want comprehensive management capabilities, so that I can control all aspects of the platform including content, users, and payments.

#### Acceptance Criteria

1. THE Admin_Panel SHALL provide interfaces for managing courses, sections, videos, and study materials
2. WHEN admin uploads content, THE Content_Management_System SHALL store and organize materials appropriately
3. THE Admin_Panel SHALL display order management with refund and cancellation controls
4. THE User_Management_System SHALL allow admin to view and manage student accounts
5. THE Analytics_Dashboard SHALL provide charts and metrics for platform performance
6. THE Payment_Tracking_System SHALL display all transactions with detailed payment information

### Requirement 7: Blog and SEO Content

**User Story:** As a visitor, I want to read educational blog content, so that I can access free information and discover the institute's offerings.

#### Acceptance Criteria

1. THE Blog_System SHALL display articles organized by categories with SEO optimization
2. WHEN visitors access blog posts, THE SEO_System SHALL serve optimized meta tags and structured data
3. THE Blog_System SHALL generate dynamic slug-based URLs for each article
4. THE Content_Editor SHALL provide rich text editing capabilities for blog creation
5. THE Blog_System SHALL display related posts to encourage further reading

### Requirement 8: Performance and Security

**User Story:** As a system administrator, I want the platform to maintain high performance and security standards, so that users have a reliable and safe experience.

#### Acceptance Criteria

1. THE Performance_System SHALL achieve Lighthouse scores of 90+ across all pages
2. THE Security_System SHALL protect all authenticated routes through middleware validation
3. WHEN users access the platform, THE Caching_System SHALL serve optimized content with minimal load times
4. THE Security_System SHALL hash JWT tokens and validate payment confirmations server-side only
5. THE Error_Handling_System SHALL provide graceful error pages (404, 500) and global error management
6. THE SEO_System SHALL generate sitemap.xml and robots.txt for search engine optimization

### Requirement 9: Content Parsing and Data Management

**User Story:** As a developer, I want robust data parsing and storage systems, so that all content is properly structured and retrievable.

#### Acceptance Criteria

1. WHEN content is uploaded, THE Data_Parser SHALL validate and structure information according to defined schemas
2. THE Database_System SHALL store all entities (users, courses, orders, payments) with proper relationships
3. WHEN data is retrieved, THE Query_System SHALL return formatted results matching API specifications
4. THE Backup_System SHALL maintain data integrity through proper validation and error handling

### Requirement 10: Theme and UI Consistency

**User Story:** As a user, I want a consistent and customizable interface, so that I have a pleasant and cohesive experience across the platform.

#### Acceptance Criteria

1. THE Theme_System SHALL use Tailwind v4 with configurable root-level color variables
2. THE UI_System SHALL implement responsive design with mobile-first approach
3. WHEN users navigate the platform, THE Animation_System SHALL provide smooth transitions and interactions
4. THE Component_System SHALL use only essential ShadCN UI components without unnecessary libraries
5. THE Theme_System SHALL allow brand color customization (primary, secondary, accent, background, text)
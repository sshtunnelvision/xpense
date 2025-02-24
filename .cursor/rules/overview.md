Product Type:

- Web app (Progressive Web App)
- Expense management/reporting tool

Core Functionality:

- Receipt capture and storage via mobile camera
- Automated receipt data extraction using OpenAI Vision API
- AI-powered expense categorization and reasoning analysis
- On-demand report generation (Excel/CSV format)
- Receipt gallery/management interface
- Real-time receipt processing status

Tech Stack:

- Frontend: Next.js 14+ with App Router and React Server Components
- UI: TailwindCSS + shadcn/ui components
- Backend: Next.js API routes
- Database: Supabase (PostgreSQL)
- Storage: Supabase Storage for receipt images
- AI: OpenAI Vision API for OCR and analysis
- Key dependencies:
  - @supabase/supabase-js
  - openai
  - xlsx/csv-parser
  - react-hook-form
  - zod (validation)
  - bcrypt (password hashing)
  - jose (JWT handling)
  - cookie (session management)

Special Requirements:

- Authentication: Custom implementation
  - Email/password authentication
  - JWT-based session management
  - Secure password hashing
  - Password reset functionality
  - Protected API routes
- Mobile-first design essential for receipt capture
- Offline capabilities for receipt capture when network unavailable
- Real-time processing status updates
- Responsive design for all screen sizes
- Accessibility requirements:
  - WCAG 2.1 compliance
  - Screen reader friendly
  - High contrast mode support
- Performance requirements:
  - Quick image upload and processing
  - Efficient image compression before upload
  - Optimized for mobile networks

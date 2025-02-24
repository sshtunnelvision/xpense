# Expense Report Builder - Lean PRD

## User Stories

- As a user, I want to quickly capture receipt photos with my phone, so that I can track expenses on the go
- As a user, I want my receipt images automatically processed, so that I don't have to manually enter data
- As a user, I want to view all my captured receipts in a gallery, so that I can manage and organize them
- As a user, I want to generate expense reports in Excel/CSV format, so that I can submit them for reimbursement
- As a user, I want AI-powered categorization of my expenses, so that I can better understand my spending

## Frontend Architecture

### 1. Setup & Configuration

Project structure:
app/
(auth)/
login/
register/
forgot-password/
dashboard/
receipts/
reports/
settings/
components/
ui/ # shadcn components
receipts/ # receipt-specific components
reports/ # report-specific components
shared/ # shared components
lib/
utils/
supabase/ # supabase client config
auth/ # auth utilities
types/ # shared TypeScript types

Key dependencies:

- tailwindcss + shadcn/ui
- react-hook-form + zod
- @supabase/supabase-js
- xlsx/csv-parser
- react-webcam (receipt capture)
- browser-image-compression

### 2. Core Features

Pages/Routes:

- `/` - Landing page
- `/login` - Authentication
- `/register` - User registration
- `/dashboard` - Main dashboard
- `/receipts` - Receipt gallery
- `/receipts/capture` - Receipt capture interface
- `/receipts/[id]` - Individual receipt view
- `/reports` - Report generation
- `/settings` - User settings

Key Components:

- `ReceiptCapture` - Camera interface with image preview
- `ReceiptGallery` - Grid/list view of receipts
- `ReceiptDetail` - Individual receipt view/edit
- `ReportGenerator` - Report configuration and export
- `AuthGuard` - Protected route wrapper

State Management:

- Server components for most data fetching
- React Query for client-side state
- Context for auth state
- Local storage for offline data

### 3. Data Flow

- Image capture → local compression → upload to Supabase Storage
- Receipt processing status updates via polling
- Offline queue for pending uploads
- Real-time updates using Supabase realtime

## Backend Architecture

### 1. Setup & Configuration

Project structure:
app/
api/
auth/
receipts/
reports/
lib/
auth/
openai/
supabase/
types/

Key dependencies:

- bcrypt
- jose
- cookie
- openai

Environment variables:
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_KEY
OPENAI_API_KEY
JWT_SECRET

### 2. Core Features

API Endpoints:
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/reset-password
POST /api/receipts/upload
GET /api/receipts
GET /api/receipts/[id]
DELETE /api/receipts/[id]
POST /api/reports/generate
GET /api/reports/[id]

Authentication:

- JWT-based sessions with HTTP-only cookies
- Password hashing with bcrypt
- Rate limiting on auth endpoints

Background Tasks:

- Receipt image processing queue
- OpenAI Vision API processing
- Report generation for large datasets

### 3. Data Flow

Request handling:

- Input validation with Zod
- Authentication middleware
- Error boundary handling

Database Schema:

```sql
users (
  id uuid primary key,
  email text unique,
  password_hash text,
  created_at timestamp
)

receipts (
  id uuid primary key,
  user_id uuid references users(id),
  image_url text,
  extracted_data jsonb,
  ai_category text,
  ai_reasoning text,
  status text,
  created_at timestamp
)

reports (
  id uuid primary key,
  user_id uuid references users(id),
  date_range tstzrange,
  status text,
  file_url text,
  created_at timestamp
)
```

## Integration Points

API Contracts:

Receipt Upload:

```typescript
interface ReceiptUpload {
  image: File;
  metadata?: {
    date?: string;
    notes?: string;
  };
}

interface ReceiptResponse {
  id: string;
  status: "processing" | "completed" | "failed";
  imageUrl: string;
  extractedData?: {
    amount: number;
    date: string;
    vendor: string;
    items: Array<{
      description: string;
      amount: number;
    }>;
  };
  aiCategory?: string;
  aiReasoning?: string;
}
```

Report Generation:

```typescript
interface ReportRequest {
  dateRange: {
    start: string;
    end: string;
  };
  format: "xlsx" | "csv";
  groupBy?: "category" | "date" | "vendor";
}

interface ReportResponse {
  id: string;
  status: "generating" | "completed" | "failed";
  fileUrl?: string;
}
```

Shared Types:

```typescript
interface User {
  id: string;
  email: string;
  createdAt: string;
}

interface Receipt {
  id: string;
  imageUrl: string;
  status: string;
  extractedData: Record<string, any>;
  aiCategory: string;
  aiReasoning: string;
  createdAt: string;
}

interface Report {
  id: string;
  dateRange: [string, string];
  status: string;
  fileUrl?: string;
  createdAt: string;
}
```

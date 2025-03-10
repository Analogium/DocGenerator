# EasyDocs Generator

EasyDocs Generator is a web application that allows users to create professional documents like invoices, quotes, CVs, and cover letters quickly and easily.

## Features

- Create and customize various document types:
  - Invoices
  - Quotes
  - CVs/Resumes
  - Cover Letters
- Real-time document preview
- Export to PDF
- User accounts with document storage
- Freemium subscription model

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (Authentication, Database)
- **PDF Generation**: jsPDF

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/easydocs-generator.git
   cd easydocs-generator
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Setting up Supabase

1. Create a new Supabase project
2. Run the SQL migrations in the `supabase/migrations` directory
3. Set up authentication (Email/Password)
4. Configure the environment variables with your Supabase credentials

## Project Structure

- `/app` - Next.js app router pages
- `/components` - React components
- `/lib` - Utility functions and API clients
- `/public` - Static assets
- `/supabase` - Supabase migrations and types

## Deployment

This project can be deployed to any platform that supports Next.js applications, such as Vercel, Netlify, or a custom server.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
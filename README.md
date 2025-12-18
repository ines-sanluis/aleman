# German Learning App

A Next.js application for learning German vocabulary using AI-powered word enrichment and spaced repetition (Anki-style).

## Features

- **AI-Powered Word Enrichment**: Paste German words and ChatGPT automatically adds:
  - Word type (noun, verb, adjective, etc.)
  - Gender and plural forms (for nouns)
  - Spanish translations
  - Example sentences in German and Spanish
  - Present tense and past tense conjugations (for verbs)
  - Conjugation links to external resources
  - Smart article handling (prevents duplication)

- **Spaced Repetition System (SRS)**: Based on the SM-2 algorithm (like Anki)
  - Only review words that are due today
  - Rate cards: Again, Hard, Good, Easy
  - Automatic scheduling based on your performance

- **Card Management**:
  - Edit any card field after creation
  - Delete unwanted cards
  - Search by German or Spanish words
  - View detailed statistics for each card

- **Mobile-Responsive Design**: Works seamlessly on desktop and mobile browsers

- **Dark Mode Support**: Fully accessible dark theme with proper contrast

- **Cloud Storage**: Cards saved to Vercel KV (Redis)
  - Access your cards from anywhere
  - Persistent cloud storage
  - Fast and reliable

## Getting Started

### Prerequisites

- Node.js 18+ installed
- OpenAI API key ([get one here](https://platform.openai.com/api-keys))

### Installation

1. Navigate to the project directory:
```bash
cd german-learning-app
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file and add your OpenAI API key:
```bash
cp .env.example .env.local
```

Then edit `.env.local` and add your API key:
```
OPENAI_API_KEY=your_actual_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## How to Use

### 1. Add Words
- Click "Add" in the navigation
- Paste German words (one per line or comma-separated)
- Click "Enrich Words with AI"
- Review the enriched data and click "Save All Cards"

### 2. Daily Review
- The home page shows how many cards are due today
- Click "Start Review Session"
- See the German word and try to recall the meaning
- Click "Show Answer" to reveal the translation and example
- Rate yourself: Again, Hard, Good, or Easy
- The app automatically schedules the next review

### 3. Library
- View all your cards
- Search by German or Spanish words
- **Edit any card** by clicking the blue edit icon
- See review statistics (interval, ease factor, next review date)
- Delete cards or export/import your collection

### 4. Editing Cards
- Click the blue edit icon next to any card in the Library
- Modify any field: word, translation, examples, conjugations, etc.
- Changes are saved to the cloud immediately
- SRS scheduling data is preserved when editing

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (with dark mode support)
- **AI**: OpenAI GPT-4o-mini (word enrichment) + TTS-1 (pronunciation)
- **Storage**: Vercel KV (Redis)
- **Algorithm**: SM-2 (SuperMemo 2) spaced repetition

## Deployment to Vercel

### Step 1: Create a Vercel Project

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com) and sign in
3. Click "Add New" → "Project"
4. Import your GitHub repository
5. Click "Deploy"

### Step 2: Set up Vercel KV

1. In your Vercel project dashboard, go to the "Storage" tab
2. Click "Create Database"
3. Select "KV" (Redis)
4. Choose a name (e.g., "german-cards-db")
5. Select a region close to you
6. Click "Create"
7. Vercel will automatically add the required environment variables (`KV_URL`, `KV_REST_API_URL`, `KV_REST_API_TOKEN`, etc.)

### Step 3: Add OpenAI API Key

1. In your Vercel project, go to "Settings" → "Environment Variables"
2. Add `OPENAI_API_KEY` with your OpenAI API key
3. Click "Save"
4. Redeploy your project

### Step 4: Done!

Your app is now live! The cards are stored in Vercel KV and accessible from anywhere.

## Export/Import

Use the export/import feature for backups:

1. Go to Library
2. Click "Export" to download a backup JSON file
3. Click "Import" to restore or merge cards from a backup file

## License

MIT

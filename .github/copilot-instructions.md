# CVcraft - Generador de CVs con IA

## Project Overview

AI-powered CV generator that adapts your resume to specific job offers.
Users can fill a form or upload an existing PDF, paste a job offer, and get an optimized CV.

## Tech Stack

- Next.js 14 (App Router)
- TypeScript (strict mode)
- Tailwind CSS
- Supabase (auth only)
- Groq API (Llama 3.3 70b)
- pdf-lib (PDF generation)
- shadcn/ui

## Project Structure

- `app/(auth)/login/` → authentication page
- `app/dashboard/` → main app: form + PDF upload + job offer + result
- `app/api/generate-cv/` → API route for AI CV generation
- `app/api/parse-pdf/` → API route for PDF text extraction
- `components/cv/` → CV form, preview, and PDF components
- `lib/supabase.ts` → Supabase browser client
- `lib/supabase-server.ts` → Supabase server client
- `lib/groq.ts` → Groq client
- `types/index.ts` → shared TypeScript types

## Core Flow

1. User logs in with Google
2. User fills form with their info OR uploads existing CV PDF
3. User pastes the job offer they want to apply to
4. AI analyzes both and generates an optimized CV
5. User sees a preview on screen
6. User downloads the CV as PDF

## Key Types

- CVFormData: personalInfo, experience, education, skills
- GeneratedCV: summary, experience, skills, keywords, matchScore
- JobOffer: raw text pasted by user

## AI Features

- Extract text from uploaded PDF
- Adapt CV content to match job offer keywords
- Generate professional summary tailored to the offer
- Calculate match score (0-100%) between CV and job offer

## Code Conventions

- Always use TypeScript with strict types, no `any`
- API keys only on server-side route handlers
- Use `@supabase/ssr` for server-side auth
- Groq model: "llama-3.3-70b-versatile"

## Environment Variables

NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
GROQ_API_KEY

## Idioma

Todos los textos visibles de la aplicación deben estar en español argentino.
Usar "vos" en lugar de "tú" o "usted".
Comentarios en el código pueden ser en inglés.

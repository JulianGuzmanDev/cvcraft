import { NextRequest, NextResponse } from 'next/server'
import { groq } from '@/lib/groq'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { cvData, jobOffer } = body as { cvData: any; jobOffer: string }

    const prompt = `IMPORTANT: Generate ALL content in Spanish (Argentina). 
Use professional Argentine Spanish. Do not use any English words except for technical terms.

STRICT RULES:
- NEVER modify, invent or change education data. Copy it exactly as provided.
- NEVER invent or add experience that was not provided.
- NEVER change job titles, company names, or dates.
- Only rewrite experience DESCRIPTIONS to better match the job offer keywords.
- The summary and skills can be adapted, everything else must be copied exactly.

You are an expert CV writer. Analyze the job offer and adapt the CV to match it.
Return a JSON object with this exact structure:
{ summary: string (3-4 sentences professional summary tailored to the job),
  experience: [{ company, position, startDate, endDate, description (rewritten to match job keywords) }],
  skills: string[] (reordered and filtered to match job requirements),
  keywords: string[] (top 8 keywords from the job offer found in the CV),
  matchScore: number (0-100, how well the CV matches the job offer) }
Return ONLY the JSON, no markdown, no explanation.

CV:${JSON.stringify(cvData)}

JobOffer:${jobOffer}`

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
    })

    const content = response.choices?.[0]?.message?.content || ''
    let parsed
    try {
      const cleanJson = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      parsed = JSON.parse(cleanJson)
      
      // Add education data directly from input (don't let AI modify it)
      parsed.education = cvData.education || []
    } catch (e) {
      parsed = { error: 'invalid json from model', raw: content }
    }

    return NextResponse.json(parsed)
  } catch (err) {
    console.error('generate-cv error', err)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}

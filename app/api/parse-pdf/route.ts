import { NextRequest, NextResponse } from 'next/server'
import { extractText } from 'unpdf'
import { groq } from '@/lib/groq'
import { createClient } from '@/lib/supabase-server' // server-side auth helper

export async function POST(req: NextRequest) {
  try {
    // authenticate user
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'not authenticated' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) {
      return NextResponse.json({ error: 'no file provided' }, { status: 400 })
    }
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'file must be a PDF' }, { status: 400 })
    }
    const maxSize = 5 * 1024 * 1024 // 5 MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'file too large (max 5MB)' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const { text } = await extractText(new Uint8Array(arrayBuffer), { mergePages: true })
    const safeText = text.slice(0, 5000) // limit length

    const prompt = `Extract CV information from this text and return a JSON object with this exact structure:
{ personalInfo: { name, email, phone, location, linkedin }, 
  experience: [{ company, position, startDate, endDate, description }],
  education: [{ institution, degree, year }],
  skills: [] }
Return ONLY the JSON, no markdown, no explanation.
\nText:\n${safeText}`

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
    })

    const content = response.choices?.[0]?.message?.content || ''
    let parsed
    try {
      const cleanJson = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      parsed = JSON.parse(cleanJson)
    } catch (e) {
      parsed = { error: 'invalid json from model', raw: content }
    }

    return NextResponse.json(parsed)
  } catch (err) {
    console.error('parse-pdf error', err)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}

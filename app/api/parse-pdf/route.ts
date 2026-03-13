import { NextRequest, NextResponse } from 'next/server'
import { extractText } from 'unpdf'
import { groq } from '@/lib/groq'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) {
      return NextResponse.json({ error: 'no file provided' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const { text } = await extractText(new Uint8Array(arrayBuffer), { mergePages: true })

    const prompt = `Extract CV information from this text and return a JSON object with this exact structure:
{ personalInfo: { name, email, phone, location, linkedin }, 
  experience: [{ company, position, startDate, endDate, description }],
  education: [{ institution, degree, year }],
  skills: [] }
Return ONLY the JSON, no markdown, no explanation.
\nText:\n${text}`

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

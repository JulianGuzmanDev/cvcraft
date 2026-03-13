"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { supabase } from '@/lib/supabase'
import CVDocument from './CVDocument'

interface Experience {
  id: number
  company: string
  position: string
  startDate: string
  endDate: string
  description: string
}

interface Education {
  id: number
  institution: string
  degree: string
  year: string
}

interface DashboardClientProps {
  email?: string | null
}

interface GeneratedCV {
  summary: string
  experience: Array<{
    company: string
    position: string
    startDate: string
    endDate: string
    description: string
  }>
  education: Array<{
    institution: string
    degree: string
    year: string
  }>
  skills: string[]
  keywords: string[]
  matchScore: number
}

export default function DashboardClient({ email }: DashboardClientProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'form' | 'pdf'>('form')

  const [personalInfo, setPersonalInfo] = useState({
    name: '',
    email: email || '',
    phone: '',
    location: '',
    linkedin: ''
  })

  const [experiences, setExperiences] = useState<Experience[]>([])
  const [educations, setEducations] = useState<Education[]>([])
  const [skillInput, setSkillInput] = useState('')
  const [skills, setSkills] = useState<string[]>([])

  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [pdfSuccess, setPdfSuccess] = useState('')

  const [jobOffer, setJobOffer] = useState('')
  const [jobError, setJobError] = useState('')
  const [generateLoading, setGenerateLoading] = useState(false)
  const [generatedCV, setGeneratedCV] = useState<GeneratedCV | null>(null)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const addExperience = () => {
    setExperiences(prev => [
      ...prev,
      { id: Date.now(), company: '', position: '', startDate: '', endDate: '', description: '' }
    ])
  }

  const updateExperience = (id: number, field: keyof Experience, value: string) => {
    setExperiences(prev =>
      prev.map(exp => (exp.id === id ? { ...exp, [field]: value } : exp))
    )
  }

  const addEducation = () => {
    setEducations(prev => [
      ...prev,
      { id: Date.now(), institution: '', degree: '', year: '' }
    ])
  }

  const updateEducation = (id: number, field: keyof Education, value: string) => {
    setEducations(prev =>
      prev.map(ed => (ed.id === id ? { ...ed, [field]: value } : ed))
    )
  }

  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault()
      if (!skills.includes(skillInput.trim())) {
        setSkills(prev => [...prev, skillInput.trim()])
      }
      setSkillInput('')
    }
  }

  const removeSkill = (skill: string) => {
    setSkills(prev => prev.filter(s => s !== skill))
  }

  const handlePdfChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setPdfFile(file)
      setPdfLoading(true)
      setPdfSuccess('')
      try {
        const formData = new FormData()
        formData.append('file', file)
        const res = await fetch('/api/parse-pdf', {
          method: 'POST',
          body: formData,
        })
        const data = await res.json()
        
        // Directly populate form fields from API response
        if (data.personalInfo) {
          setPersonalInfo({
            name: data.personalInfo.name || '',
            email: data.personalInfo.email || '',
            phone: data.personalInfo.phone || '',
            location: data.personalInfo.location || '',
            linkedin: data.personalInfo.linkedin || ''
          })
        }
        if (Array.isArray(data.experience)) {
          setExperiences(
            data.experience.map((exp: any, idx: number) => ({
              id: Date.now() + idx,
              company: exp.company || '',
              position: exp.position || '',
              startDate: exp.startDate || '',
              endDate: exp.endDate || '',
              description: exp.description || '',
            }))
          )
        }
        if (Array.isArray(data.education)) {
          setEducations(
            data.education.map((ed: any, idx: number) => ({
              id: Date.now() + idx,
              institution: ed.institution || '',
              degree: ed.degree || '',
              year: ed.year || '',
            }))
          )
        }
        if (Array.isArray(data.skills)) {
          setSkills(data.skills.filter((s: any) => typeof s === 'string'))
        }
        
        // Show success message
        setPdfSuccess('¡CV extraído correctamente! Revisá y editá tu información.')
        
        // Switch to form tab automatically
        setActiveTab('form')
      } catch (err) {
        console.error('PDF parse error', err)
      } finally {
        setPdfLoading(false)
      }
    }
  }

  const handleGenerate = async () => {
    if (!jobOffer.trim()) {
      setJobError('La descripción del puesto es obligatoria')
      return
    }
    setJobError('')
    setGenerateLoading(true)
    try {
      const cvData = {
        personalInfo,
        experience: experiences,
        education: educations,
        skills,
      }
      const res = await fetch('/api/generate-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvData, jobOffer }),
      })
      const result = await res.json()
      setGeneratedCV(result)
    } catch (err) {
      console.error('generate error', err)
    } finally {
      setGenerateLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <nav className="flex items-center justify-between px-8 py-4">
        <h1 className="text-2xl font-bold bg-linear-to-r from-purple-400 to-blue-500 text-transparent bg-clip-text">
          CVcraft
        </h1>
        <div className="flex items-center space-x-4">
          {email && <span className="text-sm opacity-75">{email}</span>}
          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 transition"
          >
            Cerrar sesión
          </button>
        </div>
      </nav>

      <div className="flex flex-1 p-8 gap-8">
        {/* left panel */}
        <div className="w-3/5 flex flex-col">
          <div className="mb-4">
            <button
              onClick={() => setActiveTab('form')}
              className={`px-4 py-2 mr-2 rounded ${
                activeTab === 'form' ? 'bg-purple-600' : 'bg-gray-700'
              }`}
            >
              Completar formulario
            </button>
            <button
              onClick={() => setActiveTab('pdf')}
              className={`px-4 py-2 rounded ${
                activeTab === 'pdf' ? 'bg-purple-600' : 'bg-gray-700'
              }`}
            >
              Subir PDF
            </button>
          </div>

          {activeTab === 'form' ? (
            <div className="space-y-6 overflow-auto">
              {pdfSuccess && (
                <div className="bg-green-600 p-3 rounded text-white mb-4">
                  {pdfSuccess}
                </div>
              )}
              {/* personal info */}
              <section className="space-y-2">
                <h2 className="text-xl font-semibold">Información personal</h2>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Nombre completo"
                    value={personalInfo.name}
                    onChange={e =>
                      setPersonalInfo(prev => ({ ...prev, name: e.target.value }))
                    }
                    className="p-2 bg-gray-800 rounded w-full"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={personalInfo.email}
                    onChange={e =>
                      setPersonalInfo(prev => ({ ...prev, email: e.target.value }))
                    }
                    className="p-2 bg-gray-800 rounded w-full"
                  />
                  <input
                    type="text"
                    placeholder="Teléfono"
                    value={personalInfo.phone}
                    onChange={e =>
                      setPersonalInfo(prev => ({ ...prev, phone: e.target.value }))
                    }
                    className="p-2 bg-gray-800 rounded w-full"
                  />
                  <input
                    type="text"
                    placeholder="Ubicación"
                    value={personalInfo.location}
                    onChange={e =>
                      setPersonalInfo(prev => ({ ...prev, location: e.target.value }))
                    }
                    className="p-2 bg-gray-800 rounded w-full"
                  />
                  <input
                    type="text"
                    placeholder="LinkedIn URL"
                    value={personalInfo.linkedin}
                    onChange={e =>
                      setPersonalInfo(prev => ({ ...prev, linkedin: e.target.value }))
                    }
                    className="p-2 bg-gray-800 rounded w-full col-span-2"
                  />
                </div>
              </section>

              {/* experiences */}
              <section className="space-y-2">
                <h2 className="text-xl font-semibold">Experiencia laboral</h2>
                {experiences.map(exp => (
                  <div key={exp.id} className="space-y-2 bg-gray-800 p-4 rounded">
                    <input
                      type="text"
                      placeholder="Empresa"
                      value={exp.company}
                      onChange={e => updateExperience(exp.id, 'company', e.target.value)}
                      className="p-2 bg-gray-700 rounded w-full"
                    />
                    <input
                      type="text"
                      placeholder="Cargo"
                      value={exp.position}
                      onChange={e => updateExperience(exp.id, 'position', e.target.value)}
                      className="p-2 bg-gray-700 rounded w-full"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Fecha inicio"
                        value={exp.startDate}
                        onChange={e => updateExperience(exp.id, 'startDate', e.target.value)}
                        className="p-2 bg-gray-700 rounded w-full"
                      />
                      <input
                        type="text"
                        placeholder="Fecha fin"
                        value={exp.endDate}
                        onChange={e => updateExperience(exp.id, 'endDate', e.target.value)}
                        className="p-2 bg-gray-700 rounded w-full"
                      />
                    </div>
                    <textarea
                      placeholder="Descripción"
                      value={exp.description}
                      onChange={e => updateExperience(exp.id, 'description', e.target.value)}
                      className="p-2 bg-gray-700 rounded w-full"
                    />
                  </div>
                ))}
                <button
                  onClick={addExperience}
                  className="px-4 py-2 bg-green-600 rounded hover:bg-green-700 transition"
                >
                  Agregar experiencia
                </button>
              </section>

              {/* education */}
              <section className="space-y-2">
                <h2 className="text-xl font-semibold">Educación</h2>
                {educations.map(ed => (
                  <div key={ed.id} className="space-y-2 bg-gray-800 p-4 rounded">
                    <input
                      type="text"
                      placeholder="Institución"
                      value={ed.institution}
                      onChange={e => updateEducation(ed.id, 'institution', e.target.value)}
                      className="p-2 bg-gray-700 rounded w-full"
                    />
                    <input
                      type="text"
                      placeholder="Título"
                      value={ed.degree}
                      onChange={e => updateEducation(ed.id, 'degree', e.target.value)}
                      className="p-2 bg-gray-700 rounded w-full"
                    />
                    <input
                      type="text"
                      placeholder="Año"
                      value={ed.year}
                      onChange={e => updateEducation(ed.id, 'year', e.target.value)}
                      className="p-2 bg-gray-700 rounded w-full"
                    />
                  </div>
                ))}
                <button
                  onClick={addEducation}
                  className="px-4 py-2 bg-green-600 rounded hover:bg-green-700 transition"
                >
                  Agregar educación
                </button>
              </section>

              {/* skills */}
              <section className="space-y-2">
                <h2 className="text-xl font-semibold">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {skills.map(s => (
                    <span
                      key={s}
                      className="bg-purple-600 px-3 py-1 rounded flex items-center space-x-2"
                    >
                      <span>{s}</span>
                      <button onClick={() => removeSkill(s)} className="text-xs">
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Agregar skill y presionar Enter"
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={handleSkillKeyDown}
                  className="p-2 bg-gray-800 rounded w-full"
                />
              </section>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-600 p-8 rounded text-center">
                <p className="mb-4">Arrastra tu CV o seleccioná un archivo</p>
                <input type="file" accept="application/pdf" onChange={handlePdfChange} />
              </div>
              {pdfFile && <p className="mt-2">Archivo: {pdfFile.name}</p>}
              {pdfLoading && <p className="mt-2 font-semibold">Analizando tu CV...</p>}
              <p className="text-sm opacity-75">
                El PDF se procesará con IA para extraer tu información
              </p>
            </div>
          )}

          {/* bottom textarea and button */}
          <div className="mt-auto pt-8">
            <textarea
              placeholder="Pegá la descripción del puesto al que querés aplicar"
              value={jobOffer}
              onChange={e => setJobOffer(e.target.value)}
              className="w-full p-4 bg-gray-800 rounded h-32"
            />
            {jobError && <p className="text-red-400 mt-1">{jobError}</p>}
            <button
              onClick={handleGenerate}
              disabled={generateLoading}
              className="mt-4 w-full py-4 bg-linear-to-r from-purple-500 to-blue-500 rounded text-lg font-semibold disabled:opacity-50"
            >
              {generateLoading ? 'Generando con IA...' : 'Generar CV con IA'}
            </button>
          </div>
        </div>

        {/* right panel */}
        <div className="w-2/5 bg-gray-900 p-8 rounded flex flex-col">
          {generatedCV ? (
            <>
              <div className="flex-1 overflow-auto space-y-6">
                <div>
                  <span
                    className={`px-2 py-1 rounded text-sm font-semibold ${
                      generatedCV.matchScore > 70
                        ? 'bg-green-600'
                        : generatedCV.matchScore >= 40
                        ? 'bg-yellow-500'
                        : 'bg-red-600'
                    }`}
                  >
                    {generatedCV.matchScore}% de compatibilidad
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold">Resumen profesional</h3>
                  <p>{generatedCV.summary}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    {generatedCV.keywords.map(k => (
                      <span
                        key={k}
                        className="bg-blue-600 px-2 py-1 rounded text-sm"
                      >
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold">Experiencia</h4>
                  {generatedCV.experience.map((exp, i) => (
                    <div key={i} className="space-y-1">
                      <p className="font-semibold">
                        {exp.company} — {exp.position}
                      </p>
                      <p className="text-sm">
                        {exp.startDate} - {exp.endDate}
                      </p>
                      <p>{exp.description}</p>
                    </div>
                  ))}
                </div>
                <div>
                  <h4 className="font-semibold">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {generatedCV.skills.map(s => (
                      <span
                        key={s}
                        className="bg-purple-600 px-3 py-1 rounded text-sm"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <PDFDownloadLink
                document={<CVDocument generatedCV={generatedCV} personalInfo={personalInfo} />}
                fileName={`CV-${personalInfo.name}-${new Date().toISOString().split('T')[0]}.pdf`}
              >
                {({ blob, url, loading, error }) => (
                  <button
                    className="mt-4 px-4 py-2 w-full bg-green-500 rounded hover:bg-green-600 transition disabled:opacity-50"
                    disabled={loading || !generatedCV}
                  >
                    {loading ? 'Generando PDF...' : 'Descargar PDF'}
                  </button>
                )}
              </PDFDownloadLink>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="opacity-75">Tu CV generado aparecerá acá</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

'use client'

import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
  },
  nameText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1e3a5f',
  },
  contactInfo: {
    fontSize: 9,
    color: '#666666',
    marginBottom: 3,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#1e3a5f',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e3a5f',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1e3a5f',
    paddingBottom: 5,
  },
  experienceEntry: {
    marginBottom: 10,
  },
  entryHeader: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  entryDate: {
    fontSize: 9,
    color: '#666666',
    marginBottom: 3,
  },
  entryDescription: {
    fontSize: 10,
    lineHeight: 1.4,
    marginBottom: 5,
  },
  educationEntry: {
    marginBottom: 8,
  },
  skillsText: {
    fontSize: 10,
    lineHeight: 1.4,
  },
})

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

interface PersonalInfo {
  name: string
  email: string
  phone: string
  location: string
  linkedin: string
}

interface CVDocumentProps {
  generatedCV: GeneratedCV
  personalInfo: PersonalInfo
}

export default function CVDocument({ generatedCV, personalInfo }: CVDocumentProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.nameText}>{personalInfo.name}</Text>
          <View>
            <Text style={styles.contactInfo}>
              {[personalInfo.email, personalInfo.phone, personalInfo.location, personalInfo.linkedin]
                .filter(Boolean)
                .join(' | ')}
            </Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Resumen Profesional */}
        {generatedCV.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Resumen Profesional</Text>
            <Text style={{ fontSize: 10, lineHeight: 1.5 }}>
              {generatedCV.summary}
            </Text>
          </View>
        )}

        {/* Experiencia */}
        {generatedCV.experience && generatedCV.experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experiencia</Text>
            {generatedCV.experience.map((exp, idx) => (
              <View key={idx} style={styles.experienceEntry}>
                <Text style={styles.entryHeader}>
                  {exp.position} en {exp.company}
                </Text>
                <Text style={styles.entryDate}>
                  {exp.startDate} - {exp.endDate}
                </Text>
                <Text style={styles.entryDescription}>
                  {exp.description}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Educación */}
        {generatedCV.education && generatedCV.education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Educación</Text>
            {generatedCV.education.map((edu, idx) => (
              <View key={idx} style={styles.educationEntry}>
                <Text style={{ fontSize: 11, fontWeight: 'bold' }}>
                  {edu.degree} en {edu.institution}
                </Text>
                <Text style={styles.entryDate}>{edu.year}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Habilidades */}
        {generatedCV.skills && generatedCV.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Habilidades</Text>
            <Text style={styles.skillsText}>
              {generatedCV.skills.join(', ')}
            </Text>
          </View>
        )}

      </Page>
    </Document>
  )
}

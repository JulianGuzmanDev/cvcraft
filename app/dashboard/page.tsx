import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import DashboardClient from '@/components/cv/DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  const user = data.user

  // redirect before we try to use `user` or access its properties
  if (!user) {
    redirect('/login')
  }

  return (
    // server component - pass email to client
    <div>
      <DashboardClient email={user.email ?? null} />
    </div>
  )
}
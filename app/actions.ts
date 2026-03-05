'use server'
import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

export async function createBooking(formData: FormData) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const toolId = formData.get('toolId')
  const userName = formData.get('userName')
  const startDate = formData.get('startDate')
  const endDate = formData.get('endDate')

  const { error } = await supabase.from('bookings').insert([
    { 
      tool_id: toolId, 
      user_name: userName, 
      start_date: startDate, 
      end_date: endDate 
    }
  ])

  if (error) {
    console.error('Fehler beim Buchen:', error.message)
    return
  }

  // Das sorgt dafür, dass die Seite sofort aktualisiert wird
  revalidatePath('/')
}

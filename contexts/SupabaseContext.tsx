import { createClient } from '@supabase/supabase-js'

// NEXT_PUBLIC_SUPABASE_URL=https://ucntmhnssxrrmspecams.supabase.co
// NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjbnRtaG5zc3hycm1zcGVjYW1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2NDI0NzIsImV4cCI6MjA3NjIxODQ3Mn0.MDiR11ReMFAQVK5Ch1yuN9RuIp-yaebtOQ4sSJ0t2oo
// NEXT_PUBLIC_SUPABASE_BUCKET_NAME=tango-images

const env = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  anon: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  bucket: process.env.NEXT_PUBLIC_SUPABASE_BUCKET_NAME,
}

Object.entries(env).forEach(([key, value]) => {
  if (!value) throw new Error(`Missing environment variable: ${key}`)
})

export const supabase = createClient(env.url!, env.anon!)


export function getImage(path: string | undefined | null) {
  if (!path) return "/placeholder.svg"

  // Si ya es una URL completa (empieza con http), devolverla directamente
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path
  }

  try {
    const { data } = supabase.storage
      .from(env.bucket!)
      .getPublicUrl(path)

    return data?.publicUrl || "/placeholder.svg"
  } catch (error) {
    console.error("Unexpected error getting public URL:", error)
    return "/placeholder.svg"
  }
}
export async function uploadImage(path: string, file: File) {
    if (!file) {
        return
    }
    try {
        var { error } = await supabase.storage
            .from(env.bucket!)
            .upload(path, file)

        return error ? null : path
    } catch (error) {
        console.error('Error uploading image:', error)
        return null
    }

}

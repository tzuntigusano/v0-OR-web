import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    // Usamos las variables de entorno que configuramos en Vercel
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    // Intercambiamos el código de Discord por una sesión real
    await supabase.auth.exchangeCodeForSession(code)
  }

  // URL a la que redirigir tras el login (tu página de inicio)
  return NextResponse.redirect(requestUrl.origin)
}
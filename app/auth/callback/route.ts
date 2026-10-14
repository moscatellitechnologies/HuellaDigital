import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )
    
    // Intercambia el código de la URL por una sesión real
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      const isLocalEnv = process.env.NODE_ENV === 'development'
      
      if (isLocalEnv) {
        // En local, podemos redirigir a una ruta absoluta
        return NextResponse.redirect(`${origin}${next}`)
      } else {
         // En Vercel o Producción usamos rutas relativas si es posible,
         // o forzamos el uso del Forwarded Host para evitar errores de protocolo inverso
         const forwardedHost = request.headers.get('x-forwarded-host') 
         if (forwardedHost) {
           return NextResponse.redirect(`https://${forwardedHost}${next}`)
         }
         return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // Fallback si algo falla o el usuario cancela: vuelve al login.
  return NextResponse.redirect(`${origin}/auth/login?error=auth-callback-failed`)
}
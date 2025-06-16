// middleware.ts
import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

// Protege todas as rotas que começam com "/home"
const PROTECTED_PREFIXES = ["/home"];

// Rotas que devem ser excluídas da proteção mesmo estando em /protected
const EXCLUDED_PROTECTED_ROUTES = ["/protected/reset-password"];

export const updateSession = async (request: NextRequest) => {
  try {
    let response = NextResponse.next({
      request: { headers: request.headers },
    });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value),
            );
            response = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options),
            );
          },
        },
      }
    );

    const { data: { user }, error } = await supabase.auth.getUser();

    const path = request.nextUrl.pathname;

    // Verifica se é uma rota excluída da proteção
    if (EXCLUDED_PROTECTED_ROUTES.includes(path)) {
      return response;
    }

    // Se o path começar com um prefixo protegido e não houver usuário logado
    if (PROTECTED_PREFIXES.some(prefix => path.startsWith(prefix)) && !user) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    // Se já estiver logado e tentar acessar sign-in ou sign-up
    if ((path === "/sign-in" || path === "/sign-up") && user) {
      return NextResponse.redirect(new URL("/home", request.url));
    }

    return response;
  } catch (error) {
    console.error("Erro no middleware:", error);
    return NextResponse.next({
      request: { headers: request.headers },
    });
  }
};

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};


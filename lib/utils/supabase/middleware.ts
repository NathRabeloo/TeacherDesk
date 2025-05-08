// middleware.ts
import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

// Protege todas as rotas que começam com "/home"
const PROTECTED_PREFIXES = ["/home"];

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

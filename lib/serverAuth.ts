import { GetServerSidePropsContext } from 'next';
import { createServerClient, CookieOptions } from '@supabase/ssr';
export const withServerSideAuth = async (context: GetServerSidePropsContext, _options?: any) => {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return context.req.cookies[name];
        },
        set() {}, // Not used in server-side auth
        remove() {}, // Not used in server-side auth
      },
    }
  );
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return {
      redirect: {
        destination: '/auth/login',
        permanent: false,
      },
    };
  }
  return {
    props: {
      initialSession: session,
      user: session.user,
    },
  };
};
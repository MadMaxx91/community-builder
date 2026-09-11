import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface PushPayload {
  user_id: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

serve(async (req) => {
  if (req.method !== 'POST') return new Response('method not allowed', { status: 405 });

  const payload: PushPayload = await req.json();
  const { user_id, title, body, data } = payload;

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  // Fetch this user's push tokens
  const { data: tokens, error } = await supabase
    .from('push_tokens')
    .select('token')
    .eq('user_id', user_id);

  if (error || !tokens?.length) {
    return new Response(JSON.stringify({ sent: 0 }), { status: 200 });
  }

  // Also write a notification row so the in-app centre shows it
  await supabase.from('notifications').insert({
    user_id,
    type: data?.type ?? 'generic',
    title,
    body,
    emoji: (data?.emoji as string) ?? '📢',
    data: data ?? {},
  });

  // Send via Expo Push API
  const messages = tokens.map(({ token }) => ({
    to: token,
    title,
    body,
    sound: 'default',
    data,
  }));

  const resp = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(messages),
  });

  const result = await resp.json();
  return new Response(JSON.stringify({ sent: messages.length, result }), { status: 200 });
});

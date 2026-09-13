import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

interface InvitePayload {
  email: string;
  community_name: string;
  join_code: string;
  invited_by: string;
}

serve(async (req) => {
  if (req.method !== 'POST') return new Response('method not allowed', { status: 405 });

  const { email, community_name, join_code, invited_by }: InvitePayload = await req.json();

  const resendKey = Deno.env.get('RESEND_API_KEY');
  if (!resendKey) return new Response('RESEND_API_KEY not set', { status: 500 });

  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;color:#1C1813;">
      <h1 style="font-size:24px;margin-bottom:8px;">You're invited to ${community_name}</h1>
      <p><strong>${invited_by}</strong> has invited you to join their community on <strong>Torbu</strong>.</p>
      <p>Open the Torbu app and enter this join code:</p>
      <p style="font-size:28px;font-weight:bold;letter-spacing:4px;color:#2E5E3A;">${join_code}</p>
      <p style="color:#7A7165;font-size:13px;">Together Our Resources Build Unity.</p>
    </div>`;

  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Torbu <noreply@torbu.app>',
      to: email,
      subject: `${invited_by} invited you to ${community_name} on Torbu`,
      html,
    }),
  });

  const result = await resp.json();
  return new Response(JSON.stringify(result), { status: resp.status });
});

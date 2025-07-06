// File: api/nango-auth-token.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { userId } = req.body || {};
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  const secret = process.env.NANGO_SECRET_KEY;
  if (!secret) {
    console.error('Missing NANGO_SECRET_KEY');
    return res.status(500).json({ error: 'Server misconfiguration' });
  }

  try {
    const r = await fetch('https://api.nango.dev/auth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${secret}`
      },
      body: JSON.stringify({ userId })
    });

    const text = await r.text();
    if (!r.ok) {
      console.error('Nango error:', text);
      return res.status(r.status).json({ error: text });
    }

    const { session_token } = JSON.parse(text);
    return res.status(200).json({ session_token });
  } catch (e) {
    console.error('Handler threw:', e);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

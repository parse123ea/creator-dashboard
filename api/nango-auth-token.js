// File: api/nango-auth-token.js

export default async function handler(req, res) {
  // 0) Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(200).end();
  }

  // 1) Only POST is allowed beyond this point
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 2) Pull userId out of the JSON body
  const { userId } = req.body || {};
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  // 3) Grab your Nango secret key
  const secret = process.env.NANGO_SECRET_KEY;
  if (!secret) {
    console.error('Missing NANGO_SECRET_KEY');
    return res.status(500).json({ error: 'Server misconfiguration' });
  }

  try {
    // 4) Call Nango's REST endpoint
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

    // 5) Parse and return the session token
    const { session_token } = JSON.parse(text);
    return res.status(200).json({ session_token });
  } catch (e) {
    console.error('Handler threw:', e);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

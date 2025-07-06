// File: api/nango-auth-token.js

export default async function handler(req, res) {
  // Verify we got a JSON body
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  let body;
  try {
    body = req.body;
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  const { userId } = body;
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  // Make sure the secret key is present
  const secret = process.env.NANGO_SECRET_KEY;
  if (!secret) {
    console.error('Missing NANGO_SECRET_KEY!');
    return res.status(500).json({ error: 'Server misconfiguration' });
  }

  try {
    // Call Nango's REST endpoint
    const resp = await fetch('https://api.nango.dev/auth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${secret}`
      },
      body: JSON.stringify({ userId })
    });

    const text = await resp.text();
    if (!resp.ok) {
      // Bubble up any error text
      console.error('Nango REST error:', text);
      return res.status(resp.status).json({ error: text });
    }

    // Parse and return JSON
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      throw new Error('Invalid JSON from Nango: ' + text);
    }

    return res.status(200).json({ session_token: json.session_token });
  } catch (e) {
    console.error('Handler error:', e);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

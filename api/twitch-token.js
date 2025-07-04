// api/twitch-token.js

// If your Vercel runtime is Node.js <18, uncomment the next line:
// import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { uid } = req.query;
  if (!uid) {
    return res.status(400).json({ error: 'Missing uid parameter' });
  }

  try {
    const nangoRes = await fetch(
      `https://api.nango.dev/connection/twitch/${encodeURIComponent(uid)}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.NANGO_SECRET_KEY}`
        }
      }
    );

    if (!nangoRes.ok) {
      const errText = await nangoRes.text();
      console.error('Nango error:', errText);
      return res.status(nangoRes.status).json({ error: errText });
    }

    const connection = await nangoRes.json();
    // connection.access_token, .refresh_token, .expires_at, .scope, etc.
    return res.status(200).json(connection);
  } catch (err) {
    console.error('Error fetching Twitch token from Nango:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

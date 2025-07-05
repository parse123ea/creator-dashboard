// Filename: /api/nango-auth-token.js

import { Nango } from '@nango/node';

// This is the main function Vercel will run
export default async function handler(request, response) {
  // Use environment variables for security
  const nango = new Nango({ secretKey: process.env.NANGO_SECRET_KEY });

  // Get the userId from the request body
  const { userId } = request.body;

  if (!userId) {
    return response.status(400).json({ error: 'userId is required' });
  }

  try {
    // Create the secure, temporary token for the frontend
    const sessionToken = await nango.auth.createSessionToken({
      userId: userId,
    });

    // Send the token back to the frontend
    return response.status(200).json({ session_token: sessionToken });

  } catch (error) {
    console.error('Nango session token error:', error);
    return response.status(500).json({ error: 'Failed to create session token' });
  }
}

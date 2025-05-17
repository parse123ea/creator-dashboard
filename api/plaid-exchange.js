export default async function handler(req, res) {
  const { public_token } = req.body;

  const response = await fetch('https://hook.us2.make.com/tgcufl4n97orwgetnpmrzhfu11xmh7xe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.PLAID_CLIENT_ID,
      secret: process.env.PLAID_SECRET,
      public_token
    })
  });

  const data = await response.json();
  res.status(200).json(data);
}

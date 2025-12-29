// pages/api/csrf-token.js
import { getCsrfToken } from 'next-auth/react';

export default async function handler(req, res) {
  const csrfToken = await getCsrfToken({ req });
  res.status(200).json({ csrfToken });
}






import type { NextApiRequest, NextApiResponse } from 'next';

type ResponseData = {
  reply: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method === 'POST') {
    const { message } = req.body;
    // In a real application, you would process the message and generate a response
    res.status(200).json({ reply: `You said: ${message}` });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

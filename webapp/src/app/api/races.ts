import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }
  try {
    const races = await prisma.race.findMany()
    res.status(200).json(races)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch races' })
  }
}

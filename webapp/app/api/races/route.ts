import { NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  try {
    const races = await prisma.race.findMany()
    return new Response(JSON.stringify(races), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch races' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

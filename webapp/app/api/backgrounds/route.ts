import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const backgrounds = await prisma.background.findMany()
    return new Response(JSON.stringify(backgrounds), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch backgrounds' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
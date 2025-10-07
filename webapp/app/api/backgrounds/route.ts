import { NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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
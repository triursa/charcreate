import { NextResponse } from 'next/server'
import { ancestries } from '@/data/ancestries'

export async function GET() {
  return NextResponse.json(ancestries)
}

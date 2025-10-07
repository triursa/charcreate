import { NextResponse } from 'next/server'
import { backgrounds } from '@/data/backgrounds'

export async function GET() {
  return NextResponse.json(backgrounds)
}

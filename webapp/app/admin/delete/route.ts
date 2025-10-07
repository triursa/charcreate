import { NextRequest, NextResponse } from 'next/server'
import { buildAdminRedirectUrl, describePrismaError, getPrismaClient, parseIdParam } from '../helpers'

export async function POST(request: NextRequest) {
  const baseUrl = new URL(request.url)
  const idParam = parseIdParam(request.nextUrl.searchParams.get('id'))

  if (!idParam.ok) {
    const url = buildAdminRedirectUrl(baseUrl, 'error', idParam.error)
    return NextResponse.redirect(url, { status: 303 })
  }

  try {
    const prisma = getPrismaClient()
    await prisma.spell.delete({ where: { id: idParam.id } })

    const url = buildAdminRedirectUrl(baseUrl, 'success', `Deleted entry ${idParam.id}.`)
    return NextResponse.redirect(url, { status: 303 })
  } catch (error) {
    console.error('Failed to delete entry', error)
    const message = describePrismaError(error)
    const url = buildAdminRedirectUrl(baseUrl, 'error', message)
    return NextResponse.redirect(url, { status: 303 })
  }
}

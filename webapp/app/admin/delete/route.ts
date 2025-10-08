import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  buildAdminRedirectUrl,
  describePrismaError,
  getAdminDelegate,
  parseAdminModelParam,
  parseIdParam,
} from '../helpers'

export async function POST(request: NextRequest) {
  const baseUrl = new URL(request.url)
  const params = request.nextUrl.searchParams

  const modelResult = parseAdminModelParam(params.get('model'))
  const model = modelResult.ok ? modelResult.model : modelResult.fallback
  const modelMeta = modelResult.meta

  if (!modelResult.ok) {
    const url = buildAdminRedirectUrl(baseUrl, 'error', modelResult.error, { model })
    return NextResponse.redirect(url, { status: 303 })
  }

  const idResult = parseIdParam(params.get('id'))

  if (!idResult.ok) {
    const url = buildAdminRedirectUrl(baseUrl, 'error', idResult.error, { model })
    return NextResponse.redirect(url, { status: 303 })
  }

  try {
    const delegate = getAdminDelegate(model, prisma)
    await delegate.delete({ where: { id: idResult.id } })

    const url = buildAdminRedirectUrl(
      baseUrl,
      'success',
      `Deleted ${modelMeta.singularLabel} ${idResult.id}.`,
      { model },
    )
    return NextResponse.redirect(url, { status: 303 })
  } catch (error) {
    console.error('Failed to delete entry', error)
    const message = describePrismaError(error)
    const url = buildAdminRedirectUrl(baseUrl, 'error', message, { model })
    return NextResponse.redirect(url, { status: 303 })
  }
}

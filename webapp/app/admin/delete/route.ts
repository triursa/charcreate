import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ADMIN_MODELS, buildAdminRedirectUrl, describePrismaError, getAdminDelegate, normalizeAdminModel, parseIdParam } from '../helpers'

export async function POST(request: NextRequest) {
  const baseUrl = new URL(request.url)
  const params = request.nextUrl.searchParams
  const idParam = parseIdParam(params.get('id'))
  const model = normalizeAdminModel(params.get('model'))
  const modelMeta = ADMIN_MODELS.find(option => option.key === model) ?? ADMIN_MODELS[0]

  if (!idParam.ok) {
    const url = buildAdminRedirectUrl(baseUrl, 'error', idParam.error, { model })
    return NextResponse.redirect(url, { status: 303 })
  }

  try {
    const delegate = getAdminDelegate(model, prisma)
    await delegate.delete({ where: { id: idParam.id } })

    const url = buildAdminRedirectUrl(
      baseUrl,
      'success',
      `Deleted ${modelMeta.singularLabel} ${idParam.id}.`,
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

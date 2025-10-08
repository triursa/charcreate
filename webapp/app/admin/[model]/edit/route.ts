import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  buildAdminRedirectUrl,
  describePrismaError,
  getAdminDelegate,
  parseAdminModelParam,
  parseIdParam,
} from '../../helpers'
import { ADMIN_FORM_CONFIG } from '../../formConfig'
import { describeAdminFormErrors, parseAdminFormData } from '../../formSubmission'

export async function POST(request: NextRequest, { params }: { params: { model: string } }) {
  const baseUrl = new URL(request.url)
  const modelParam = params.model

  const modelResult = parseAdminModelParam(modelParam)
  const model = modelResult.ok ? modelResult.model : modelResult.fallback
  const modelMeta = modelResult.meta

  if (!modelResult.ok) {
    const url = buildAdminRedirectUrl(baseUrl, 'error', modelResult.error, { model })
    return NextResponse.redirect(url, { status: 303 })
  }

  const formConfig = ADMIN_FORM_CONFIG[model]
  if (!formConfig) {
    const url = buildAdminRedirectUrl(baseUrl, 'error', 'Unsupported admin model.', { model })
    return NextResponse.redirect(url, { status: 303 })
  }

  const formData = await request.formData()
  const idRaw = formData.get('id')
  const idResult = parseIdParam(typeof idRaw === 'string' ? idRaw : null)

  if (!idResult.ok) {
    const url = buildAdminRedirectUrl(baseUrl, 'error', idResult.error, { model })
    return NextResponse.redirect(url, { status: 303 })
  }

  const parsed = parseAdminFormData(formData, formConfig.fields)

  if (!parsed.ok) {
    const message = describeAdminFormErrors(model, parsed.errors)
    const url = buildAdminRedirectUrl(baseUrl, 'error', message, { model })
    return NextResponse.redirect(url, { status: 303 })
  }

  try {
    const delegate = getAdminDelegate(model, prisma)
    await delegate.update({ where: { id: idResult.id }, data: parsed.data })
    const url = buildAdminRedirectUrl(
      baseUrl,
      'success',
      `Updated ${modelMeta.singularLabel} ${idResult.id}.`,
      { model },
    )
    return NextResponse.redirect(url, { status: 303 })
  } catch (error) {
    console.error('Failed to update entry', error)
    const message = describePrismaError(error)
    const url = buildAdminRedirectUrl(baseUrl, 'error', message, { model })
    return NextResponse.redirect(url, { status: 303 })
  }
}

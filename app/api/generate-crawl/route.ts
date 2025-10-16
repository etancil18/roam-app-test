import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json()

  const { tags, tier } = body

  const route = [
    {
      name: 'Sister Louisa’s Church',
      lat: 33.7561,
      lon: -84.3836,
      instagram: '@sisterlouisas',
    },
    {
      name: 'MJQ Concourse',
      lat: 33.7716,
      lon: -84.3516,
      instagram: '@mjqconcourse',
    },
  ]

  return NextResponse.json({ route })
}

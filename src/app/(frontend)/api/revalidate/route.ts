import { revalidatePath, revalidateTag } from 'next/cache'
export async function POST(request: Request) {
  if (request.headers.get('x-revalidate-secret') !== process.env.REVALIDATE_SECRET) return Response.json({ ok:false }, { status:401 })
  const body = await request.json().catch(()=>({})) as { path?: string }
  revalidatePath(body.path || '/', 'page'); revalidateTag('afluma-content', 'max')
  return Response.json({ ok:true, path: body.path || '/' })
}

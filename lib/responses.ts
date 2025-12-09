export const success = (data: any, status: number = 200) =>
  Response.json(
    {
      success: true,
      data,
    },
    { status }
  );

export const error = (message: string, status: number = 400) =>
  Response.json(
    {
      success: false,
      message,
    },
    { status }
  );
export function success(data: any, status = 200) {
  return new Response(JSON.stringify({ ok: true, data }), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })
}

export function fail(msg: string, status = 400) {
  return new Response(JSON.stringify({ ok: false, msg }), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })
}

export function unauthorized() {
  return fail('Unauthorized', 401)
}

export function serverError(err?: any) {
  console.error(err)
  return fail('Server error', 500)
}
export const success = (data: any, status: number = 200) => {
  return Response.json({ ok: true, data }, { status })
}

export const fail = (msg: string, status: number = 400) => {
  return Response.json({ ok: false, msg }, { status })
}

export const unauthorized = () => fail('Unauthorized', 401)

export const serverError = (err: any) => {
  console.error(err)
  return fail('Server error', 500)
}

export const validationError = (msg: string) => fail(msg, 422)
export function success(data: any = null, message: string = '') {
  return Response.json(
    { status: 'success', message, data },
    { status: 200 }
  )
}

export function created(data: any = null, message: string = 'Created successfully') {
  return Response.json(
    { status: 'success', message, data },
    { status: 201 }
  )
}

export function badRequest(message: string = 'Bad request') {
  return Response.json(
    { status: 'error', message },
    { status: 400 }
  )
}

export function unauthorized(message: string = 'Unauthorized') {
  return Response.json(
    { status: 'error', message },
    { status: 401 }
  )
}

export function forbidden(message: string = 'Forbidden') {
  return Response.json(
    { status: 'error', message },
    { status: 403 }
  )
}

export function notFound(message: string = 'Resource not found') {
  return Response.json(
    { status: 'error', message },
    { status: 404 }
  )
}

export function conflict(message: string = 'Conflict') {
  return Response.json(
    { status: 'error', message },
    { status: 409 }
  )
}

export function serverError(message: string = 'Internal server error') {
  return Response.json(
    { status: 'error', message },
    { status: 500 }
  )
}

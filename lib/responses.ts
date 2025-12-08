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

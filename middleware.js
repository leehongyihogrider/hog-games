/* global process */

function unauthorized() {
  return new Response('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Hog Games"',
      'Content-Type': 'text/plain; charset=utf-8'
    }
  });
}

export default function middleware(request) {
  const user = process.env.SITE_AUTH_USER;
  const pass = process.env.SITE_AUTH_PASS;

  // Disabled unless both env vars are set
  if (!user || !pass) {
    return;
  }

  const authHeader = request.headers.get('authorization') || '';
  if (!authHeader.startsWith('Basic ')) {
    return unauthorized();
  }

  const encoded = authHeader.slice(6);
  let decoded = '';

  try {
    decoded = atob(encoded);
  } catch {
    return unauthorized();
  }

  if (decoded !== `${user}:${pass}`) {
    return unauthorized();
  }

  return;
}

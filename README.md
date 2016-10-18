# Example Auth Provider

Example implementation of a 3rd party auth provider for Oddworks. This should guide developers build routes on their webside so that Oddworks powered app can authenticate viewers to login and watch content.

Your website should implement the routes described below. While the actual routes do not matter, since they are configurable in Oddworks, the responses and payloads do matter so that Oddworks can interpret them correctly.

## Running Example Server

```bash
$ npm run dev
```

This will start the example server on http://localhost:3000 with `/login` and `/verify` routes.

There is also a demo running at Heroku at http://example-auth-provider.herokuapp.com for your convenience to try. We recommend using https://www.getpostman.com to issue requests for testing.

## `POST http://yourdomain.com/login`

**Oddworks Request**

```json
{
  "type": "authentication",
  "attributes": {
    "email": "viewer@yourdomain.com",
    "password": "pass12345"
  }
}
```

**Your Server Response**

When Oddworks posts to your login route it should respond with a **HTTP 200** with the following payload so that Oddworks can stay in sync.

- `id` - this is the record number of your viewer/user on your end
- `email` - Oddworks will keep this as the canonical ID in our system so that we can look up users by email quickly when serving content
- `jwt` - this is YOUR JWT used later on when Oddworks needs to re-verify users so we can login on their behalf without requiring Oddworks to store their password locally.

```json
{
  "id": "YOUR_VIEWER_RECORD_ID",
  "type": "viewer",
  "attributes": {
    "email": "viewer@yourdomain.com"
  },
  "meta": {
    "jwt": "YOUR_SIGNED_JWT"
  }
}
```

## `POST http://yourdomain.com/verify`

**Oddworks Request**

```json
{
  "type": "authorization",
  "attributes": {
    "jwt": "THE_JWT_YOU_SENT_FROM_ABOVE"
  }
}
```

**Your Server Response**

Should return the same response as above since Oddworks is logging in as a user with a JWT instead. The only exception is that the response should contain an updated JWT for the user.

```json
{
  "id": "YOUR_VIEWER_RECORD_ID",
  "type": "viewer",
  "attributes": {
    "email": "viewer@yourdomain.com"
  },
  "meta": {
    "jwt": "YOUR_SIGNED_JWT"
  }
}
```
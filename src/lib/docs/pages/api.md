# API Documentation

## src\app\api\conversations\route.ts

### POST



**Type:** route

**Signature:** `POST(req: Request)`

### GET



**Type:** route

**Signature:** `GET(req: Request)`

## src\app\api\conversations\[conversationId]\messages\route.ts

### POST



**Type:** route

**Signature:** `POST(req: Request, { params }: { params: { conversationId: string } })`

## src\app\api\conversations\[conversationId]\route.ts

### GET



**Type:** route

**Signature:** `GET(req: Request, { params }: { params: { conversationId: string } })`

### PATCH



**Type:** route

**Signature:** `PATCH(req: Request, { params }: { params: { conversationId: string } })`

### DELETE



**Type:** route

**Signature:** `DELETE(req: Request, { params }: { params: { conversationId: string } })`

## src\app\api\layers\route.ts

### GET



**Type:** route

**Signature:** `GET(req: Request)`

## src\app\api\marketplace\route.ts

### GET



**Type:** route

**Signature:** `GET(req: Request)`

### POST



**Type:** route

**Signature:** `POST(req: Request)`

## src\app\api\search\route.ts

### GET



**Type:** route

**Signature:** `GET(req: Request)`

## src\app\api\settings\route.ts

### GET



**Type:** route

**Signature:** `GET()`

### PATCH



**Type:** route

**Signature:** `PATCH(req: Request)`

## src\app\api\stats\route.ts

### GET



**Type:** route

**Signature:** `GET()`

## src\app\api\tools\route.ts

### GET

// Get all enabled tools for the user

**Type:** route

**Signature:** `GET()`

## src\app\api\user\profile\route.ts

### GET



**Type:** route

**Signature:** `GET()`

### PATCH



**Type:** route

**Signature:** `PATCH(req: Request)`

## src\app\api\ws\route.ts

### GET

// Move health check inside the request handler

**Type:** route

**Signature:** `GET(req: Request)`

## src\app\globals.css

### globals

Stylesheet

**Type:** style

## src\app\layout.tsx

### RootLayout



**Type:** function

**Signature:** `RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>)`

## src\app\page.tsx

### Home



**Type:** function

**Signature:** `Home()`
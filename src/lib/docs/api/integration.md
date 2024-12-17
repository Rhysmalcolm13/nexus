# Integration Points


## API Routes

### src\app\api\conversations\route.ts

#### `POST`



**Signature:** `POST(req: Request)`

#### `GET`



**Signature:** `GET(req: Request)`

### src\app\api\conversations\[conversationId]\messages\route.ts

#### `POST`



**Signature:** `POST(req: Request, { params }: { params: { conversationId: string } })`

### src\app\api\conversations\[conversationId]\route.ts

#### `GET`



**Signature:** `GET(req: Request, { params }: { params: { conversationId: string } })`

#### `PATCH`



**Signature:** `PATCH(req: Request, { params }: { params: { conversationId: string } })`

#### `DELETE`



**Signature:** `DELETE(req: Request, { params }: { params: { conversationId: string } })`

### src\app\api\layers\route.ts

#### `GET`



**Signature:** `GET(req: Request)`

### src\app\api\marketplace\route.ts

#### `GET`



**Signature:** `GET(req: Request)`

#### `POST`



**Signature:** `POST(req: Request)`

### src\app\api\search\route.ts

#### `GET`



**Signature:** `GET(req: Request)`

### src\app\api\settings\route.ts

#### `GET`



**Signature:** `GET()`

#### `PATCH`



**Signature:** `PATCH(req: Request)`

### src\app\api\stats\route.ts

#### `GET`



**Signature:** `GET()`

### src\app\api\tools\route.ts

#### `GET`

// Get all enabled tools for the user

**Signature:** `GET()`

### src\app\api\user\profile\route.ts

#### `GET`



**Signature:** `GET()`

#### `PATCH`



**Signature:** `PATCH(req: Request)`

### src\app\api\ws\route.ts

#### `GET`

// Move health check inside the request handler

**Signature:** `GET(req: Request)`
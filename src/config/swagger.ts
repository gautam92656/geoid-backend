import swaggerUi from "swagger-ui-express"
import type { Application } from "express"

const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "Astra Backend API",
    version: "1.0.0",
    description: "Starter API with auth, client CRUD, and FAQ CRUD",
  },
  servers: [{ url: "/api/v1" }],
  tags: [
    { name: "Auth", description: "Signup, login, OTP, forgot/reset password" },
    { name: "Clients", description: "Client CRUD (requires Bearer token)" },
    { name: "FAQs", description: "FAQ CRUD (requires Bearer token)" },
  ],
  paths: {
    "/auth/signup": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user",
        requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } },
        responses: { "201": { description: "User created, OTP sent" } },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login with email and password",
        responses: { "200": { description: "Login successful or OTP resent" } },
      },
    },
    "/auth/verify-otp": {
      post: {
        tags: ["Auth"],
        summary: "Verify email OTP",
        responses: { "200": { description: "Email verified, JWT returned" } },
      },
    },
    "/auth/forgot-password": {
      post: {
        tags: ["Auth"],
        summary: "Request password reset OTP",
        responses: { "200": { description: "OTP sent if account exists" } },
      },
    },
    "/auth/reset-password": {
      post: {
        tags: ["Auth"],
        summary: "Reset password",
        responses: { "200": { description: "Password updated" } },
      },
    },
    "/clients": {
      get: {
        tags: ["Clients"],
        summary: "List clients",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Paginated client list" } },
      },
      post: {
        tags: ["Clients"],
        summary: "Create client",
        security: [{ bearerAuth: [] }],
        responses: { "201": { description: "Client created" } },
      },
    },
    "/clients/{id}": {
      get: {
        tags: ["Clients"],
        summary: "Get client by ID",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: { "200": { description: "Client details" } },
      },
      patch: {
        tags: ["Clients"],
        summary: "Update client",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: { "200": { description: "Client updated" } },
      },
      delete: {
        tags: ["Clients"],
        summary: "Delete client",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: { "200": { description: "Client removed" } },
      },
    },
    "/faqs": {
      get: {
        tags: ["FAQs"],
        summary: "List FAQs",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Paginated FAQ list" } },
      },
      post: {
        tags: ["FAQs"],
        summary: "Create FAQ",
        security: [{ bearerAuth: [] }],
        responses: { "201": { description: "FAQ created" } },
      },
    },
    "/faqs/{id}": {
      get: {
        tags: ["FAQs"],
        summary: "Get FAQ by ID",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: { "200": { description: "FAQ details" } },
      },
      patch: {
        tags: ["FAQs"],
        summary: "Update FAQ",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: { "200": { description: "FAQ updated" } },
      },
      delete: {
        tags: ["FAQs"],
        summary: "Delete FAQ",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: { "200": { description: "FAQ removed" } },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
}

export function setupSwagger(app: Application, path: string): void {
  app.use(path, swaggerUi.serve, swaggerUi.setup(swaggerSpec))
}

import { z } from "zod";

export function generateBadRequestExample(schema: z.ZodTypeAny) {
  const result = schema.safeParse({});

  return {
    description: "Validation failed",
    schema: {
      example: !result.success
        ? {
            statusCode: 400,
            message: "Validation failed",
            errors: result.error.issues.map(issue => ({
              code: issue.code,
              expected: (issue as any).expected,
              received: (issue as any).received,
              message: issue.message,
              path: issue.path,
            })),
          }
        : null,
    },
  };
}

export function generateNotFoundExample(entity: string) {
  return {
    description: "Error: Not Found",
    schema: {
      example: {
        message: `${entity} not found`,
        error: "Not Found",
        statusCode: 404,
      },
    },
  };
}

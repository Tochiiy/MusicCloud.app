export const ApiStatusType = {
  SUCCESS: { code: 200, message: 'Success' },
  CREATED: { code: 201, message: 'Created' },
  BAD_REQUEST: { code: 400, message: 'Bad Request' },
  UNAUTHORIZED: { code: 401, message: 'Unauthorized' },
  FORBIDDEN: { code: 403, message: 'Forbidden' },
  NOT_FOUND: { code: 404, message: 'Not Found' },
  SERVER_ERROR: { code: 500, message: 'Server Error' },
} as const;

export type ApiStatus = keyof typeof ApiStatusType;
export type ApiStatusInfo = (typeof ApiStatusType)[ApiStatus];
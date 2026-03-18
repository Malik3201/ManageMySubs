class ApiError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
  }

  static badRequest(message = 'Bad request', code = 'BAD_REQUEST') {
    return new ApiError(message, 400, code);
  }

  static unauthorized(message = 'Unauthorized', code = 'UNAUTHORIZED') {
    return new ApiError(message, 401, code);
  }

  static forbidden(message = 'Forbidden', code = 'FORBIDDEN') {
    return new ApiError(message, 403, code);
  }

  static notFound(message = 'Resource not found', code = 'NOT_FOUND') {
    return new ApiError(message, 404, code);
  }

  static conflict(message = 'Conflict', code = 'CONFLICT') {
    return new ApiError(message, 409, code);
  }
}

module.exports = ApiError;

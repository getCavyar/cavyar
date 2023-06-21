export enum DefaultResponses {
  InvalidRequestBody = "Invalid Request Body",
  InvalidRequest = "Invalid Request",
}

export class SuccessResponse<T> {
  statusCode: number;
  message: string;
  data: T;

  constructor(statusCode: number, message: string, data: T) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }

  public static default() {
    return {
      statusCode: 200,
      message: "Operation was successful",
      data: null,
    };
  }

  public static new<T>(statusCode: number, message: string, data: T) {
    return {
      statusCode,
      message,
      data,
    };
  }
}

export class ErrorResponse {
  statusCode: number;
  message: string;
  data: string | null;

  constructor(statusCode: number, message: string, data: string | null) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }

  public static default() {
    return createError({
      statusCode: 500,
      message: "An unknown error occurred",
      data: null,
    });
  }

  public static new(statusCode: number, message: string, data: string | null) {
    return createError({
      statusCode,
      message,
      data,
    });
  }

  public static unauthorized() {
    return createError({
      statusCode: 401,
      message: "Unauthorized",
      data: null,
    });
  }

  public static notFound() {
    return createError({
      statusCode: 404,
      message: "Not Found",
      data: null,
    });
  }
}

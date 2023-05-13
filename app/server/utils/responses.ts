export enum DefaultResponses {
  InvalidRequestBody = "Invalid Request Body",
  InvalidRequest = "Invalid Request",
}

export class SuccessResponse {
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
      statusCode: 200,
      message: "Operation was successful",
      data: null,
    });
  }

  public static new(statusCode: number, message: string, data: string | null) {
    return createError({
      statusCode: statusCode,
      message: message,
      data: data,
    });
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
      statusCode: statusCode,
      message: message,
      data: data,
    });
  }
}

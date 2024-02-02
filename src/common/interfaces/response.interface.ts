export interface IResponsePagination {
  page: number;
  total: number;
  size: number;
}

export interface IResponseError {
  field: string;
  message: string;
}

export interface IResponse<T = unknown> {
  response_schema: {
    response_code: string;

    response_message: string;
  };

  response_output?: {
    errors?: IResponseError[];
    list?: {
      pagination?: IResponsePagination;
      content: T[];
    };
    detail?: T;
  };
}

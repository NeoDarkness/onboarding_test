export interface IResponsePagination {
  page: number;
  total: number;
  size: number;
}

export interface IResponseError {
  field: string;
  message: string;
}

export interface IResponseList<T = unknown> {
  pagination?: IResponsePagination;
  content: T[];
}

export interface IResponseOptions<T = unknown> {
  errors?: IResponseError[];
  list?: IResponseList<T>;
  detail?: T;
}

export interface IResponse<T = unknown> {
  response_schema: {
    response_code: string;

    response_message: string;
  };

  response_output?: IResponseOptions<T>;
}

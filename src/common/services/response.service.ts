import { HttpStatus, Injectable } from '@nestjs/common';
import {
  IResponsePagination,
  IResponse,
  IResponseError,
} from '../interfaces/response.interface';

@Injectable()
export class ResponseService {
  public codeFormater(module: string, statusCode: HttpStatus): string {
    return `TEST-${module.toUpperCase()}-${statusCode}`;
  }

  public success<T>(
    code: string,
    message: string,
    options?: {
      content?: T | T[];
      pagination?: IResponsePagination;
    },
  ): IResponse<T> {
    const { content, pagination } = options ?? {};
    const res: IResponse<T> = {
      response_schema: {
        response_code: code,
        response_message: message,
      },
      response_output: null,
    };

    if (content) {
      if (Array.isArray(content)) {
        res.response_output = {
          list: {
            pagination,
            content,
          },
        };
      } else {
        res.response_output = {
          detail: content,
        };
      }
    }

    return res;
  }

  public failed(
    code: string,
    message: string,
    options?: { errors?: IResponseError[] },
  ): IResponse {
    const { errors } = options ?? {};
    const res: IResponse = {
      response_schema: {
        response_code: code,
        response_message: message,
      },
      response_output: null,
    };

    if (errors && errors.length > 0) {
      res.response_output = {
        errors,
      };
    }

    return res;
  }
}

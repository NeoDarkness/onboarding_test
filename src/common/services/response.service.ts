import { HttpStatus, Injectable } from '@nestjs/common';
import { IResponse, IResponseOptions } from '../interfaces/response.interface';

@Injectable()
export class ResponseService {
  private static codeFormater(
    moduleName: string,
    statusCode: HttpStatus,
  ): string {
    return `TEST-${moduleName.toUpperCase()}-${statusCode}`;
  }

  public static responseBuilder<T>(
    moduleName: string,
    statusCode: HttpStatus,
    message: string,
    options?: IResponseOptions<T>,
  ): IResponse<T> {
    const { list, detail, errors } = options ?? {};

    const code = ResponseService.codeFormater(moduleName, statusCode);

    const res: IResponse<T> = {
      response_schema: {
        response_code: code,
        response_message: message,
      },
      response_output: null,
    };

    if (list || detail || (errors && errors.length > 0)) {
      res.response_output = {
        list,
        detail,
        errors,
      };
    }

    return res;
  }
}

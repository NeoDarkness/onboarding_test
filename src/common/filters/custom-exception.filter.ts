import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ResponseService } from '../services/response.service';
import { IResponseError } from '../interfaces/response.interface';

@Catch()
export class CustomExceptionFilter implements ExceptionFilter {
  private moduleName: string;

  constructor(moduleName: string) {
    this.moduleName = moduleName;
  }

  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let responseStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    let responseOutput = ResponseService.responseBuilder(
      this.moduleName,
      HttpStatus.INTERNAL_SERVER_ERROR,
      'Internal server error.',
    );

    console.log(exception);

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const { message, cause: errors } = exception as {
        message: string;
        cause?: IResponseError[];
      };

      responseStatus = status;
      responseOutput = ResponseService.responseBuilder(
        this.moduleName,
        status,
        message,
        {
          errors,
        },
      );
    }

    return response.status(responseStatus).json(responseOutput);
  }
}

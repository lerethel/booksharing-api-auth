import { Catch, HttpException, RpcExceptionFilter } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { throwError } from 'rxjs';

@Catch(HttpException)
export class HttpExceptionFilter implements RpcExceptionFilter {
  catch(exception: HttpException) {
    return throwError(() => new RpcException(exception));
  }
}

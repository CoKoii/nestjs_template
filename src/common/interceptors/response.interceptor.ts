import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable, map } from "rxjs";

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<unknown>,
  ): Observable<any> {
    return next.handle().pipe(
      map((data) => ({
        code: 0,
        message: "ok",
        data,
        timestamp: Date.now(),
      })),
    );
  }
}

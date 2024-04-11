import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';


@Injectable()
export class LoggingInterceptor implements NestInterceptor {

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const token = ctx.getRequest().headers['authorization'] //['Authorization'];
    
    
    //console.log({"token":token})
    return next
      .handle()
      .pipe(
        //tap(() => console.log(`After... ${token}`)),
        map((data)=>{
          return {
            ...data,
            newToken:token
          }

        })
      );
  }
}

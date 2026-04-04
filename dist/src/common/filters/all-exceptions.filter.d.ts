import { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { AppClsStore } from '@/modules/cls/cls.module';
export declare class AllExceptionsFilter implements ExceptionFilter {
    private readonly cls;
    private readonly logger;
    constructor(cls: ClsService<AppClsStore>);
    catch(exception: unknown, host: ArgumentsHost): void;
    private classify;
}

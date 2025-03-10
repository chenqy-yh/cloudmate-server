import { UseGuards, applyDecorators, createParamDecorator } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";



export function Auth() {
    return applyDecorators(UseGuards(AuthGuard('jwt')));
}


export const User = createParamDecorator((data, context) => {
    const req = context.switchToHttp().getRequest();
    return req.user;
})
import { Body, Controller, HttpException, Inject, Post, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from 'src/modules/user/user.service';

@Controller('/')
export class AuthController {

    @Inject()
    private readonly authService: AuthService;

    @Inject()
    private readonly userService: UserService;


    @Post('login')
    login(@Body() body: { phone: string; password: string }) {
        const { phone: inputPhone, password: inputPw } = body;
        return this.authService.validateUser(inputPhone, inputPw);
    }


}

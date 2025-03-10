import { Body, Controller, HttpException, Post, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from 'src/user/user.service';

@Controller('/')
export class AuthController {

    constructor(private readonly authService: AuthService,
        private readonly userService: UserService
    ) { }

    @Post('login')
    login(@Body() body: { phone: string; password: string }) {
        const { phone: inputPhone, password: inputPw } = body;
        return this.authService.validateUser(inputPhone, inputPw);
    }


}

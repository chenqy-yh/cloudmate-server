import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { LoginService } from './login.service';

@Controller('login')
export class LoginController {

    // 引用service
    constructor(private readonly loginService: LoginService) { }


    @Post('/openid')
    async getHello(@Body('code') code: string): Promise<any> {
        const res = await this.loginService.getWxOpenId(code);
        return res;
    }

    @Post('/tokenCheck')
    async tokenCheck(@Body('token') token: string): Promise<any> {
        return !!true;
    }

}

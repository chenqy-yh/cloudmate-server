import { Controller, Get, Inject, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { Auth, User } from 'src/decorator/auth.decorator';

@Auth()
@Controller('user')
export class UserController {

    @Inject()
    private readonly userService: UserService;

    /**
     * @description test api
     * 
     */
    @Get('contacts')
    findAll(@User() user: UserPayload) {
        return this.userService.findAll(user.uuid);
    }


}

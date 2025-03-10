import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { Auth, User } from 'src/decorator/auth.decorator';
import { AttendanceService } from './attendance.service';

@Auth()
@Controller('attendance')
export class AttendanceController {

    constructor(private readonly atdService: AttendanceService) { }

    @Post('punch')
    punch(@User() user: UserPayload, @Body('lat') lat: number, @Body('lng') lng: number) {
        return this.atdService.punch(user, lat, lng);
    }

    @Get('punch_record')
    getPunchRecord(@User() user: UserPayload, @Query('day') day: number) {
        return this.atdService.findUserPunchRecord(user, day);
    }

}

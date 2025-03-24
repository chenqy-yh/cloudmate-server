import { Body, Controller, Get, Inject, Post, Query } from '@nestjs/common';
import { Auth, User } from 'src/decorator/auth.decorator';
import { UniqueDevice } from 'src/decorator/unique-device.decorator';
import { AttendanceService } from './attendance.service';

@Auth()
@UniqueDevice()
@Controller('attendance')
export class AttendanceController {

    @Inject()
    private readonly atdService: AttendanceService;

    @Post('punch')
    async punch(@User() user: UserPayload, @Body('lat') lat: number, @Body('lng') lng: number) {
        return await this.atdService.punch(user, lat, lng);
    }


    @Get('punch_record')
    getPunchRecord(@User() user: UserPayload, @Query('day') day: number) {
        return this.atdService.findUserPunchRecord(user, day);
    }

}

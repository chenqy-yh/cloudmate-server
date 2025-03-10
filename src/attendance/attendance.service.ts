import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Attendance } from 'src/entity/attendance.entity';
import { LocationService } from 'src/location/location.service';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';


// 上班打卡时间分界线
const ATD_TYPE_DIVIDER = 14;
// 考勤类型
// 上班
const STATUS_ON = 0;
// 下班
const STATUS_OFF = 1;

const MILLSEC_IN_DAY = 24 * 60 * 60 * 1000;

const PUNCH_CENTER_ADDRESS = '天津市中国民航大学北校区教二十五楼';

@Injectable()
export class AttendanceService {

    constructor(
        @InjectRepository(Attendance) private readonly atdRepo: Repository<Attendance>,
        private readonly userService: UserService,
        private readonly locationService: LocationService,
    ) { }

    /**
     * @description 获取当前天数
     * 
     */
    getCurrentDayNumber(): number {
        return Math.floor(Date.now() / MILLSEC_IN_DAY);
    }

    /**
     * @description 获取当前考勤类型
     * 0: 上班打卡 1: 下班打卡
     * 
     */
    getAttendanceType(): number {
        return new Date().getHours() < ATD_TYPE_DIVIDER ? STATUS_ON : STATUS_OFF;
    }

    async punch(payload: UserPayload, lat: number, lng: number) {
        const user = await this.userService.findUserByPayload(payload);
        // 查询当天是否已经打卡
        const day = this.getCurrentDayNumber();
        const sign_in_type = this.getAttendanceType();
        const attendance = await this.atdRepo.findOne({
            where: { day, user, sign_in_type }
        });

        if (attendance) {
            throw new BadRequestException('今日已打卡');
        }

        // 查询打卡位置
        const locationInfo = await this.locationService.reverseGeocoding(lat, lng);
        if (locationInfo.status !== 200 || locationInfo.data.status !== 0) {
            throw new BadRequestException('位置信息获取失败');
        }

        // 计算打卡距离是否合适 由后台配置
        const centerLocation = await this.locationService.getLocationByAddress(PUNCH_CENTER_ADDRESS);

        if (!centerLocation) {
            throw new NotFoundException('中心位置未配置');
        }

        const distance = this.locationService.calcDistance(centerLocation.location, { type: 'Point', coordinates: [lng, lat] });

        const inMaxDistance = distance <= centerLocation.max_distance;

        console.log('distance', distance, 'inMaxDistance', inMaxDistance);

        if (!inMaxDistance) {
            throw new BadRequestException('不在打卡范围内');
        }

        const location = locationInfo.data.result.address;

        const atdEntity = await this.atdRepo.save({
            day,
            time: new Date(),
            location,
            sign_in_type,
            user,
            userPhone: user.phone
        });

        // 过滤 atdEntity 中的 user 字段
        const { user: _, id, userPhone, ...result } = atdEntity;
        return result;
    }

    async findUserPunchRecord(payload: UserPayload, day: number) {
        const attendanceForAm = this.atdRepo.findOne({
            where: { day: day, uuid: payload.uuid, sign_in_type: 0 },
        });
        const attendanceForPm = this.atdRepo.findOne({
            where: { day: day, uuid: payload.uuid, sign_in_type: 1 }
        });
        return Promise.all([attendanceForAm, attendanceForPm]);
    }

}

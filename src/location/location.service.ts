import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { AxiosResponse } from 'axios';
import { Location } from 'src/entity/location.entity';
import { Point, Repository } from 'typeorm';

@Injectable()
export class LocationService {
    private tencentMapKey: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly httpService: HttpService,
        @InjectRepository(Location) private readonly locationRepo: Repository<Location>
    ) {
        this.tencentMapKey = this.configService.get<string>('TENCENT_MAP_KEY') ?? '';
        if (!this.tencentMapKey) {
            Logger.error('腾讯地图 key 未配置');
        }
    }

    /**
     * @description 根据经纬度获取位置信息
     * 
     */
    reverseGeocoding(latitude: number, longitude: number): Promise<AxiosResponse<LocationResponse<ReverseGeocoding>>> {
        const url = `https://apis.map.qq.com/ws/geocoder/v1/`;
        return this.httpService.axiosRef.get(url, {
            params: {
                location: `${latitude},${longitude}`,
                key: this.tencentMapKey
            }
        });
    }

    /**
     * @description 根据地址获取经纬度
     * 
     */
    geocoding(address: string): Promise<AxiosResponse<LocationResponse<Geocoding>>> {
        const url = `https://apis.map.qq.com/ws/geocoder/v1/`;
        return this.httpService.axiosRef.get(url, {
            params: {
                address,
                key: this.tencentMapKey
            }
        });

    }

    async saveLocation(address: string) {
        const res = await this.geocoding(address);
        if (res.data.status !== 0) {
            console.error(res);
            throw new BadRequestException('获取经纬度失败');
        }
        const { lat, lng } = res.data.result.location;
        const location = new Location();
        location.address = address;
        location.location = { type: 'Point', coordinates: [lng, lat] };
        await this.locationRepo.save(location);
    }

    getLocationByAddress(address: string) {
        console.log('address', address);

        return this.locationRepo.findOne({ where: { address } });
    }

    calcDistance(from: Point, to: Point) {
        const fromLng = from.coordinates[0];
        const fromLat = from.coordinates[1];
        const toLng = to.coordinates[0];
        const toLat = to.coordinates[1];
        return this.haversine(fromLat, fromLng, toLat, toLng);
    }

    haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371; // 地球半径（单位：km）
        const toRadians = (deg: number) => (deg * Math.PI) / 180;

        const dLat = toRadians(lat2 - lat1);
        const dLon = toRadians(lon2 - lon1);

        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // 距离（单位：km）
    }


}
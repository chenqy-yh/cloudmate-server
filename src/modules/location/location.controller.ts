import { Body, Controller, Inject, Post } from '@nestjs/common';
import { LocationService } from './location.service';

@Controller('location')
export class LocationController {

    @Inject()
    private readonly locationService: LocationService;

    @Post('create')
    async createLocation(@Body('address') address: string) {
        return this.locationService.saveLocation(address);
    }

}

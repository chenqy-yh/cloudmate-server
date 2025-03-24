import { Controller, Get, Inject, Param, Query } from "@nestjs/common";
import { ShareService } from "./share.service";

@Controller('share')
export class ShareController {
    @Inject()
    private readonly shareService: ShareService;

    @Get('fileList')
    getFileList(@Query('prefix') prefix: string) {
        return this.shareService.getFileList(prefix);
    }
}
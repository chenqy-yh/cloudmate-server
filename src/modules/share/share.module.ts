import { Module } from "@nestjs/common";
import { COSService } from "../cos/cos.service";
import { ShareService } from "./share.service";
import { ShareController } from "./share.controller";


@Module({
    controllers: [ShareController],
    providers: [ShareService, COSService],
})
export class ShareModule { }
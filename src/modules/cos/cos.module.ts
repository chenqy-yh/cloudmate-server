import { Global, Module } from "@nestjs/common";
import { COSService } from "./cos.service";
import { ConfigService } from "@nestjs/config";


@Global()
@Module({
    providers: [COSService, ConfigService],
    exports: [COSService]
})
export class COSModule { }
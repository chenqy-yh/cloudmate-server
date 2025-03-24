import { Inject, Injectable } from "@nestjs/common";
import { COSService } from "../cos/cos.service";


@Injectable()
export class ShareService {

    @Inject()
    private readonly cosService: COSService;

    private readonly common_prefix = 'share/';


    async getFileList(prefix: string) {
        const final_prefix = this.common_prefix + prefix;

        const identifier = await this.cosService.getTempCredentials(final_prefix, ['cos:GetBucket']);
        const { credentials, expiredTime, startTime } = identifier;
        const { sessionToken, tmpSecretId, tmpSecretKey } = credentials;
        const cos = this.cosService.createCos(startTime, expiredTime, {
            secret_id: tmpSecretId,
            secret_key: tmpSecretKey,
            secret_token: sessionToken,
        });
        return await this.cosService.getBucketDetail(cos, final_prefix);
    }

    async genSingleUrl(prefix: string, file_key: string) {
        const final_prefix = this.common_prefix + prefix;

        const identifier = await this.cosService.getTempCredentials(final_prefix, ['cos:GetBucket']);
        const { credentials, expiredTime, startTime } = identifier;
        const { sessionToken, tmpSecretId, tmpSecretKey } = credentials;
        const cos = this.cosService.createCos(startTime, expiredTime, {
            secret_id: tmpSecretId,
            secret_key: tmpSecretKey,
            secret_token: sessionToken,
        });
        const file_fullkey = prefix + file_key;
        return await this.cosService.genTempFileDownloadUrl(cos, file_fullkey);
    }



}
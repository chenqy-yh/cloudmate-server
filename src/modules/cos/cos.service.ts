import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as COS from 'cos-nodejs-sdk-v5';
import { CredentialData, getCredential, getPolicy } from 'qcloud-cos-sts';

@Injectable()
export class COSService {

    private readonly secret_id: string;
    private readonly secret_key: string;
    private readonly bucket: string;
    private readonly duration_sec: number;
    private readonly region: string;
    private readonly dl_ex: number;


    constructor(private readonly config: ConfigService) {
        this.secret_id = this.config.get<string>('TCLOUD_COS_SECRET_ID') || '';
        this.secret_key = this.config.get<string>('TCLOUD_COS_SECRET_KEY') || '';
        this.bucket = this.config.get<string>('TCLOUD_COS_BUCKET') || '';
        this.duration_sec = this.config.get<number>('TCLOUD_COS_DURATION_SEC') || 0;
        this.region = this.config.get<string>('TCLOUD_COS_REGION') || '';
        this.dl_ex = this.config.get<number>('TCLOUD_COS_DL_EX') || 0;
    }

    /**
     * @description 生成单次临时密钥
     * 
     */
    getTempCredentials(allow_prefix: string, allow_actions: COSActionType[]): Promise<CredentialData> {

        const policy = getPolicy([{
            bucket: this.bucket,
            region: this.region,
            action: allow_actions,
            prefix: allow_prefix,
        }]);
        return new Promise((res, rej) => {
            getCredential({
                secretId: this.secret_id,
                secretKey: this.secret_key,
                durationSeconds: this.duration_sec,
                policy: policy,
            }, (err, data) => {
                if (err) {
                    rej(err);
                } else {
                    res(data);
                }
            })
        })
    }

    createCos(st_time: number, ed_time: number, secret_opt: {
        secret_id: string,
        secret_key: string,
        secret_token: string,
    }) {
        return new COS({
            SecretId: secret_opt.secret_id,
            SecretKey: secret_opt.secret_key,
            SecurityToken: secret_opt.secret_token,
            StartTime: st_time,
            ExpiredTime: ed_time,
        } as unknown as COS.COSOptions)
    }


    getBucketDetail(cos: COS, prefix: string): Promise<FileItem[]> {
        if (!cos) {
            throw new Error('cos is required');
        }
        return new Promise((res, rej) => {
            cos.getBucket({
                Bucket: this.bucket,
                Region: this.region,
                Prefix: prefix,
                Delimiter: '/',
            }, (err, data) => {
                if (err) {
                    rej(err);
                } else {
                    const dir_list = data.CommonPrefixes.map((item) => {
                        return {
                            key: item.Prefix.replace(prefix, ''),
                            prefix: item.Prefix,
                            size: "0",
                            isDir: true,
                        } as FileItem
                    })
                    const file_list = data.Contents.filter(item => item.Key !== prefix).map((item) => {
                        return {
                            key: item.Key,
                            prefix: item.Key,
                            size: item.Size,
                            lastModified: item.LastModified,
                            isDir: false,
                        }
                    })
                    res([...dir_list, ...file_list]);
                }
            })
        });
    }

    genTempFileDownloadUrl(cos: COS, file_key: string) {
        return new Promise((res, rej) => {
            cos.getObjectUrl({
                Bucket: this.bucket,
                Region: this.region,
                Key: file_key,
                Sign: true,
                Expires: this.dl_ex,
            }, (err, data) => {
                if (err) rej(err)
                else {
                    res(data.Url);
                }
            })
        });

    }

}
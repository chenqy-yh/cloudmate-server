import { Injectable } from '@nestjs/common';
import axios from 'axios'

const APP_ID = 'wx9e32bc881eea2764';
const APP_SECRET = '4199b6563945f9fa6c45439a0122b5f3'


@Injectable()
export class LoginService {

    async getWxOpenId(code: string) {
        const res = await axios.get(`https://api.weixin.qq.com/sns/jscode2session?appid=${APP_ID}&secret=${APP_SECRET}&js_code=${code}&grant_type=authorization_code`);
        return res.data;
    }
}

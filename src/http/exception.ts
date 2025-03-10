import { HttpException } from "@nestjs/common";

const HttpExceptionCodeMap = {
    HAS_CHECK_IN: {
        code: 460,
        message: "今日已打卡"
    },
    THIRD_PARTY_ERROR: {
        code: 461,
        message: "第三方服务异常"
    },
}

type HttpExceptionType = keyof typeof HttpExceptionCodeMap;

export const httpException = (type: HttpExceptionType) => {
    return new HttpException(HttpExceptionCodeMap[type].message, HttpExceptionCodeMap[type].code);
}
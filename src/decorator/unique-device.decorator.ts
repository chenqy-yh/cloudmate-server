import { UseGuards, applyDecorators } from "@nestjs/common"
import { UniqueDeviceGuard } from "src/guard/unque-device.guard"

export const UniqueDevice = () => {
    return applyDecorators(UseGuards(UniqueDeviceGuard))
}
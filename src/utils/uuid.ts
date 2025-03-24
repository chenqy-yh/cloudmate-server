import { machineIdSync } from 'node-machine-id';

let counter = 0;
const machineId = machineIdSync();

export const generateId = () => {
    const timestamp = Date.now().toString(36); // 转换为 36 进制
    counter = (counter++) % 10000;
    const count = (counter).toString().padStart(4, '0'); // 4 位计数器，防止并发冲突
    return `${timestamp}-${machineId}-${count}`;
}
import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class Attendance {
    @PrimaryGeneratedColumn()
    id: number;

    // 时间戳除以24*60*60*1000得到天数 建立索引
    @Column()
    @Index()
    day: number;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    time: Date;

    @Column()
    location: string;

    @Column({ type: 'int' })
    sign_in_type: number;

    @ManyToOne(() => User, (user) => user.attendances, { onDelete: 'CASCADE' })
    @JoinColumn({
        name: 'uuid', referencedColumnName: 'uuid'
    })
    user: User;

    @Column()
    uuid: string;
}
import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Attendance } from "./attendance.entity";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    @Index()
    uuid: string;

    @Column({ nullable: true })
    name: string;

    @Column({ nullable: true })
    email: string;

    @Column({ unique: true })
    phone: string;

    @Column({})
    password: string;

    @OneToMany(() => Attendance, (attendance) => attendance.user)
    attendances: Attendance[];

}
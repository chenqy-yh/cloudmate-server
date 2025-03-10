import { Column, CreateDateColumn, Entity, Index, Point, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Location {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    @Index()
    address: string;

    @Column({
        type: 'geography',
        spatialFeatureType: 'Point',
        srid: 4326,
    })
    location: Point;  // 可以存储地址或者经纬度等信息

    @Column({ type: 'text', nullable: true })
    description: string;  // 描述该地方的附加信息

    @Column({ type: 'int', default: 500 })
    max_distance: number;  // 最大距离

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}

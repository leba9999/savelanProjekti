import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { Company } from "./company.entity";
import { URL } from "./url.entity";

@Entity()
export class ClientData {
  @PrimaryGeneratedColumn()
  ID: number;

  @Column({
    length: 2000,
    nullable: false,
  })
  UserAgent: string;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  TimeStamp: Date;

  @OneToOne(() => Company, {
    cascade: true,
    nullable: false,
  })
  @JoinColumn()
  Company: Company;

  @OneToOne(() => URL, {
    cascade: true,
  })
  @JoinColumn()
  SourcePage: URL;

  @OneToOne(() => URL, {
    cascade: true,
  })
  @JoinColumn()
  CurrentPage: URL;
}

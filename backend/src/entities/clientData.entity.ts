import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
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

  @ManyToOne(() => Company, {
    cascade: true,
    nullable: false,
  })
  @JoinColumn()
  Company: Company;

  @ManyToOne(() => URL, {
    cascade: true,
    nullable: true,
  })
  @JoinColumn()
  SourcePage: URL | null;

  @ManyToOne(() => URL, {
    cascade: true,
    nullable: false,
  })
  @JoinColumn()
  CurrentPage: URL;
}

import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Company {
  @PrimaryGeneratedColumn()
  ID: number;

  @Column({
    nullable: false,
  })
  IP: string;

  @Column({
    nullable: false,
  })
  NAME: string;
}

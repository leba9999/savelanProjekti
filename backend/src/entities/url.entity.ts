import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class URL {
  @PrimaryGeneratedColumn()
  ID: number;

  @Column({
    nullable: true,
  })
  Adress: string;
}

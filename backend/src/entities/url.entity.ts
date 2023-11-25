import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class URL {
  @PrimaryGeneratedColumn()
  ID: number;

  @Column({
    nullable: true,
    unique: true,
  })
  Adress: string;
}

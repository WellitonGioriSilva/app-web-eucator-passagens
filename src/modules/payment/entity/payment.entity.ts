import { Sale } from "src/modules/sale/entity/sale.entity";
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity("payments")
export class Payment extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 30 })
  tipo!: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  valor!: number;

  @Column({ type: "varchar", length: 30 })
  status!: string;

  @Column({ type: "datetime", nullable: true })
  dataHoraPagamento?: Date | null;

  @Column({ type: "varchar", length: 500, nullable: true })
  pixCopiaCola?: string | null;

  @ManyToOne(() => Sale, sale => sale.payments, { nullable: false })
  @JoinColumn({ name: "saleId" })
  sale!: Sale;
}

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

export enum UserRole {
  ADMIN = 'admin',
  COLABORADOR = 'colaborador'
}

@Entity('users')
@Index('IDX_USER_EMAIL', ['email'])
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ length: 255 }) // hash
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.COLABORADOR
  })
  role: UserRole;

  @CreateDateColumn()
  createdAt: Date;
}

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('posts')
export class PostEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column('text')
  body: string;

  @Column({ 
    type: 'json', 
    nullable: true,
    transformer: {
      to: (value: string[]) => value && value.length > 0 ? value : null,
      from: (value: string) => value ? (Array.isArray(value) ? value : JSON.parse(value)) : []
    }
  })
  imageAttachments: string[]; // URLs dos arquivos PNG/JPEG

  @Column({ 
    type: 'json', 
    nullable: true,
    transformer: {
      to: (value: string[]) => value && value.length > 0 ? value : null,
      from: (value: string) => value ? (Array.isArray(value) ? value : JSON.parse(value)) : []
    }
  })
  pdfAttachments: string[]; // URLs dos arquivos PDF

  @ManyToOne(() => UserEntity, { eager: true })
  @JoinColumn({ name: 'userId' })
  author: UserEntity;

  @Column({ name: 'userId' })
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity, UserRole } from '../../persistence/entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repo: Repository<UserEntity>,
  ) {}

  async create(dto: CreateUserDto) {
    console.log('Creating user with DTO:', dto);
    const email = dto.email.trim().toLowerCase();

    const exists = await this.repo.findOne({ where: { email } });
    if (exists) throw new BadRequestException('E-mail já cadastrado');

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = this.repo.create({
      name: dto.name.trim(),
      email,
      password: passwordHash,
      role: dto.role || UserRole.COLABORADOR,
    });

    

    const saved = await this.repo.save(user);

    // nunca devolver password
    const { password, ...safe } = saved;
    return safe;
  }

  async findByEmail(email: string) {
    return this.repo.findOne({ where: { email: email.trim().toLowerCase() } });
  }

  async findAll() {
    const users = await this.repo.find({
      order: { createdAt: 'DESC' }
    });

    // Remover senha de todos os usuários
    return users.map(user => {
      const { password, ...safe } = user;
      return safe;
    });
  }

  async findSafeById(id: string) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    const { password, ...safe } = user;
    return safe;
  }
}

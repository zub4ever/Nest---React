import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../persistence/entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  // POST /api/users - Apenas admins podem criar usuários
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() dto: CreateUserDto) {
    console.log('CreateUserDto:', dto);
    return this.users.create(dto);
  }

  // GET /api/users (protegido) - Apenas admins podem listar usuários
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  findAll() {
    return this.users.findAll();
  }

  // GET /api/users/me (protegido) - Qualquer usuário pode ver seus próprios dados
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: any) {
    // vem do validate() do JwtStrategy
    return this.users.findSafeById(req.user.userId);
  }
  //Listar todos os usuários (protegido)


}

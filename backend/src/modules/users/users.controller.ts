import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  // POST /api/users
  @Post()
  create(@Body() dto: CreateUserDto) {
    console.log('CreateUserDto:', dto);
    return this.users.create(dto);
  }

  // GET /api/users (protegido) - Listar todos os usuários
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.users.findAll();
  }

  // GET /api/users/me (protegido)
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: any) {
    // vem do validate() do JwtStrategy
    return this.users.findSafeById(req.user.userId);
  }
  //Listar todos os usuários (protegido)


}

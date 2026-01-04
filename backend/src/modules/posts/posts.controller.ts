import { Controller, Get, Post, Body, UseGuards, Request, Param, Put, Delete, HttpException, HttpStatus, Query } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../persistence/entities/user.entity';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // Rota pública para listagem tipo jornal (deve vir primeiro)
  @Get('public/feed')
  async getPublicFeed(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10'
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    return await this.postsService.findPublicPosts(pageNum, limitNum);
  }

  // Rota pública para visualizar post individual
  @Get('public/:id')
  async getPublicPost(@Param('id') id: string) {
    return await this.postsService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createPostDto: CreatePostDto, @Request() req: any) {
    const userId = req.user.userId;
    return await this.postsService.create(createPostDto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Request() req: any
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Se for colaborador, só mostrar seus próprios posts
    if (userRole === UserRole.COLABORADOR) {
      const myPosts = await this.postsService.findByUserId(userId);
      return {
        data: myPosts,
        total: myPosts.length,
        page: 1,
        limit: myPosts.length
      };
    }

    // Se for admin, mostrar todos os posts
    return await this.postsService.findAll(pageNum, limitNum);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-posts')
  async findMyPosts(@Request() req: any) {
    const userId = req.user.userId;
    return await this.postsService.findByUserId(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: any) {
    const post = await this.postsService.findById(id);
    const userId = req.user.userId;
    const userRole = req.user.role;

    if (!post) {
      throw new HttpException('Post não encontrado', HttpStatus.NOT_FOUND);
    }

    // Se for colaborador, só pode ver seus próprios posts
    if (userRole === UserRole.COLABORADOR && post.author.id !== userId) {
      throw new HttpException('Você não tem permissão para visualizar este post', HttpStatus.FORBIDDEN);
    }

    return post;
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @Request() req: any
  ) {
    const userId = req.user.userId;
    const userRole = req.user.role;
    const post = await this.postsService.findById(id);
    
    if (!post) {
      throw new HttpException('Post não encontrado', HttpStatus.NOT_FOUND);
    }
    
    // Admins podem editar qualquer post, colaboradores só os seus
    if (userRole === UserRole.COLABORADOR && post.author.id !== userId) {
      throw new HttpException('Você não tem permissão para editar este post', HttpStatus.FORBIDDEN);
    }
    
    return await this.postsService.update(id, updatePostDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @Request() req: any
  ) {
    const userId = req.user.userId;
    const userRole = req.user.role;
    const post = await this.postsService.findById(id);
    
    if (!post) {
      throw new HttpException('Post não encontrado', HttpStatus.NOT_FOUND);
    }
    
    // Admins podem excluir qualquer post, colaboradores só os seus
    if (userRole === UserRole.COLABORADOR && post.author.id !== userId) {
      throw new HttpException('Você não tem permissão para excluir este post', HttpStatus.FORBIDDEN);
    }
    
    await this.postsService.delete(id);
    return { message: 'Post excluído com sucesso' };
  }
}
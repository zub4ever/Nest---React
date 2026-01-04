import { Controller, Get, Post, Body, UseGuards, Request, Param } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // Rota pública para listagem tipo jornal (deve vir primeiro)
  @Get('public/feed')
  async getPublicFeed() {
    return await this.postsService.findPublicPosts();
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createPostDto: CreatePostDto, @Request() req: any) {
    const userId = req.user.userId;
    return await this.postsService.create(createPostDto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll() {
    return await this.postsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-posts')
  async findMyPosts(@Request() req: any) {
    const userId = req.user.userId;
    return await this.postsService.findByUserId(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.postsService.findById(id);
  }
}
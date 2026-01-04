import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostEntity } from '../entities/post.entity';
import { CreatePostDto } from '../../modules/posts/dto/create-post.dto';

@Injectable()
export class PostRepository {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
  ) {}

  async create(createPostDto: CreatePostDto, userId: string): Promise<PostEntity> {
    const post = this.postRepository.create({
      ...createPostDto,
      userId,
    });
    return await this.postRepository.save(post);
  }

  async findAll(): Promise<PostEntity[]> {
    return await this.postRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findByUserId(userId: string): Promise<PostEntity[]> {
    return await this.postRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<PostEntity | null> {
    return await this.postRepository.findOne({ where: { id } });
  }

  async findPublicPosts(): Promise<PostEntity[]> {
    return await this.postRepository.find({
      order: { createdAt: 'DESC' },
      take: 50, // Limitando a 50 posts mais recentes para a página pública
    });
  }
}
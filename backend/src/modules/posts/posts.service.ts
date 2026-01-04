import { Injectable } from '@nestjs/common';
import { PostRepository } from '../../persistence/repositories/post.repository';
import { CreatePostDto } from './dto/create-post.dto';
import { PostEntity } from '../../persistence/entities/post.entity';

@Injectable()
export class PostsService {
  constructor(private readonly postRepository: PostRepository) {}

  async create(createPostDto: CreatePostDto, userId: string): Promise<PostEntity> {
    return await this.postRepository.create(createPostDto, userId);
  }

  async findAll(): Promise<PostEntity[]> {
    return await this.postRepository.findAll();
  }

  async findByUserId(userId: string): Promise<PostEntity[]> {
    return await this.postRepository.findByUserId(userId);
  }

  async findById(id: string): Promise<PostEntity | null> {
    return await this.postRepository.findById(id);
  }

  async findPublicPosts(): Promise<PostEntity[]> {
    return await this.postRepository.findPublicPosts();
  }
}
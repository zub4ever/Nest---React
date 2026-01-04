import { Injectable } from '@nestjs/common';
import { PostRepository } from '../../persistence/repositories/post.repository';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostEntity } from '../../persistence/entities/post.entity';

@Injectable()
export class PostsService {
  constructor(private readonly postRepository: PostRepository) {}

  async create(createPostDto: CreatePostDto, userId: string): Promise<PostEntity> {
    return await this.postRepository.create(createPostDto, userId);
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{data: PostEntity[], total: number, page: number, limit: number}> {
    return await this.postRepository.findAll(page, limit);
  }

  async findByUserId(userId: string): Promise<PostEntity[]> {
    return await this.postRepository.findByUserId(userId);
  }

  async findById(id: string): Promise<PostEntity | null> {
    return await this.postRepository.findById(id);
  }

  async findPublicPosts(page: number = 1, limit: number = 10): Promise<{data: PostEntity[], total: number, page: number, limit: number}> {
    return await this.postRepository.findPublicPosts(page, limit);
  }

  async update(id: string, updatePostDto: UpdatePostDto): Promise<PostEntity | null> {
    return await this.postRepository.update(id, updatePostDto);
  }

  async delete(id: string): Promise<void> {
    await this.postRepository.delete(id);
  }
}
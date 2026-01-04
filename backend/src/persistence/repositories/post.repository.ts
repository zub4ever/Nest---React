import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostEntity } from '../entities/post.entity';
import { CreatePostDto } from '../../modules/posts/dto/create-post.dto';
import { UpdatePostDto } from '../../modules/posts/dto/update-post.dto';

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

  async findAll(page: number = 1, limit: number = 10): Promise<{data: PostEntity[], total: number, page: number, limit: number}> {
    const skip = (page - 1) * limit;
    
    const [data, total] = await this.postRepository.findAndCount({
      relations: ['author'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit
    };
  }

  async findByUserId(userId: string): Promise<PostEntity[]> {
    return await this.postRepository.find({
      where: { userId },
      relations: ['author'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<PostEntity | null> {
    return await this.postRepository.findOne({ 
      where: { id },
      relations: ['author']
    });
  }

  async findPublicPosts(page: number = 1, limit: number = 10): Promise<{data: PostEntity[], total: number, page: number, limit: number}> {
    const skip = (page - 1) * limit;
    
    const [data, total] = await this.postRepository.findAndCount({
      relations: ['author'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit
    };
  }

  async update(id: string, updatePostDto: UpdatePostDto): Promise<PostEntity | null> {
    await this.postRepository.update(id, updatePostDto);
    return await this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.postRepository.delete(id);
  }
}
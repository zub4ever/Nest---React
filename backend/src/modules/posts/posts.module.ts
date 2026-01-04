import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { PostEntity } from '../../persistence/entities/post.entity';
import { PostRepository } from '../../persistence/repositories/post.repository';

@Module({
  imports: [TypeOrmModule.forFeature([PostEntity])],
  controllers: [PostsController],
  providers: [PostsService, PostRepository],
  exports: [PostsService, PostRepository],
})
export class PostsModule {}
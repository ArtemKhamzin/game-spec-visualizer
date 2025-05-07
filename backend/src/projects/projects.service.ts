import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from './project.entity';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
  ) {}

  async create(name: string, data: any, owner: User): Promise<Project> {
    console.log('Saving project:', { name, data });

    const project = this.projectRepo.create({ name, data, owner });
    return this.projectRepo.save(project);
  }

  async findAllByUser(owner: User): Promise<Project[]> {
    return this.projectRepo.find({ where: { owner }, order: { updatedAt: 'DESC' } });
  }

  async findOne(id: string, owner: User): Promise<Project | null> {
    return this.projectRepo.findOne({ where: { id, owner } });
  }

  async update(id: string, data: any, owner: User): Promise<Project | null> {
    const project = await this.findOne(id, owner);
    if (!project) return null;

    project.data = data;
    return this.projectRepo.save(project);
  }

  async delete(id: string, owner: User): Promise<boolean> {
    const result = await this.projectRepo.delete({ id, owner });
    return !!result.affected && result.affected > 0;
  }
}

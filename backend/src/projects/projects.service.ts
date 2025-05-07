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

  async create(name: string, data: any, owner: User): Promise<any> {
    const existing = await this.projectRepo.findOne({
      where: { name, owner },
    });
  
    if (existing) {
      existing.data = data;
      const updated = await this.projectRepo.save(existing);
      return { ...updated, _updated: true };
    }
  
    const project = this.projectRepo.create({ name, data, owner });
    const created = await this.projectRepo.save(project);
    return { ...created, _created: true };
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

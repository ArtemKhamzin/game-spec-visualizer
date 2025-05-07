import {
    Controller,
    Get,
    Post,
    Body,
    UseGuards,
    Req,
    Param,
    Put,
    Delete,
  } from '@nestjs/common';
  import { JwtAuthGuard } from '../auth/jwt-auth.guard';
  import { ProjectsService } from './projects.service';
  import { CreateProjectDto } from './dto/create-project.dto';
  import { Request } from 'express';
  import { User } from '../users/user.entity';
  
  interface AuthRequest extends Request {
    user: { id: string; email: string };
  }
  
  @Controller('projects')
  @UseGuards(JwtAuthGuard)
  export class ProjectsController {
    constructor(private readonly projectsService: ProjectsService) {}
  
    @Post()
    async create(@Body() dto: CreateProjectDto, @Req() req: AuthRequest) {
      console.log('=== CREATE PROJECT ===');
      console.log('User:', req.user);
      console.log('DTO:', dto);
      return this.projectsService.create(dto.name, dto.data, req.user as User);
    }
  
    @Get()
    async findAll(@Req() req: AuthRequest) {
      return this.projectsService.findAllByUser(req.user as User);
    }
  
    @Get(':id')
    async findOne(@Param('id') id: string, @Req() req: AuthRequest) {
      return this.projectsService.findOne(id, req.user as User);
    }
  
    @Put(':id')
    async update(@Param('id') id: string, @Body() dto: CreateProjectDto, @Req() req: AuthRequest) {
      return this.projectsService.update(id, dto.data, req.user as User);
    }
  
    @Delete(':id')
    async delete(@Param('id') id: string, @Req() req: AuthRequest) {
      return this.projectsService.delete(id, req.user as User);
    }
  }
  
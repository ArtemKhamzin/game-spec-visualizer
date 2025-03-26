import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ParserService } from './parser.service';
import { Node, Edge } from './parser.types';

@Controller('parser')
export class ParserController {
  constructor(private readonly parserService: ParserService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File): { success: boolean; data: { nodes: Node[]; edges: Edge[] } } {
    const content = file.buffer.toString('utf-8');
    return this.parserService.parseSpecFile(content);
  }
}

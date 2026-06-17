import { ApiProperty } from '@nestjs/swagger';
import type { WorkTaskStatus } from '../entities/work-task.entity';

export class CreateWorkTaskDto {
  @ApiProperty({ description: 'Task title' })
  title: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({
    enum: ['TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED'],
    default: 'TODO',
    required: false,
  })
  status?: WorkTaskStatus;

  @ApiProperty({ enum: ['low', 'medium', 'high'], default: 'medium', required: false })
  priority?: string;

  @ApiProperty({ description: 'Assignee employee ID', required: false })
  employee?: string;

  @ApiProperty({ required: false })
  dueDate?: Date;
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { PaginationDTO } from '../../common/dto/pagination.dto';

export class ListProductDTO extends PaginationDTO {
  @ApiPropertyOptional()
  @IsOptional()
  name?: string;
}

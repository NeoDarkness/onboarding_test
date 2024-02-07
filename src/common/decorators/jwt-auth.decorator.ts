import { UseGuards, applyDecorators } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';

export const JwtAuth = applyDecorators(
  UseGuards(AuthGuard('jwt')),
  ApiBearerAuth(),
  ApiUnauthorizedResponse({ description: 'Unauthorized' }),
);

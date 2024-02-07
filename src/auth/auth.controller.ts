import {
  Body,
  Controller,
  HttpStatus,
  Post,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CustomExceptionFilter } from '../common/filters/custom-exception.filter';
import { ResponseService } from '../common/services/response.service';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { LoginDTO } from './dto/login.dto';
import { CustomerDocument } from '../customers/entities/customer.entity';
import { CurrentCustomer } from '../common/decorators/current-customer.decorator';

const moduleName = 'AUTH';

@ApiTags('auth')
@UseFilters(new CustomExceptionFilter(moduleName))
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async create(
    @Body() _body: LoginDTO,
    @CurrentCustomer() customer: Omit<CustomerDocument, 'password'>,
  ) {
    const detail = this.authService.getLoginData(customer);

    return ResponseService.responseBuilder(
      moduleName,
      HttpStatus.OK,
      'Suksess',
      { detail },
    );
  }
}

import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AdminCreateUserDto, UpdateUserStatusDto, QueryAdminUsersDto } from './dto/admin.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@giaovienhay/shared-types';

@ApiTags('Admin')
@ApiBearerAuth()
@Roles(UserRole.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  @ApiOperation({ summary: 'Lấy danh sách người dùng toàn trường (lọc role, keyword)' })
  async getAllUsers(@Query() query: QueryAdminUsersDto) {
    return this.adminService.getAllUsers(query);
  }

  @Post('users')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Admin tạo tài khoản người dùng mới' })
  async createUser(@Body() dto: AdminCreateUserDto) {
    return this.adminService.createUser(dto);
  }

  @Patch('users/:id/status')
  @ApiOperation({ summary: 'Khóa hoặc kích hoạt lại tài khoản người dùng' })
  async updateUserStatus(
    @Param('id') userId: string,
    @Body() dto: UpdateUserStatusDto,
  ) {
    return this.adminService.updateUserStatus(userId, dto);
  }

  @Get('classes')
  @ApiOperation({ summary: 'Giám sát toàn bộ các lớp học trong trường' })
  async getAllClassesMonitoring() {
    return this.adminService.getAllClassesMonitoring();
  }

  @Get('system-limits')
  @ApiOperation({ summary: 'Xem các hạn mức cấu hình hệ thống' })
  async getSystemLimits() {
    return this.adminService.getSystemLimits();
  }
}

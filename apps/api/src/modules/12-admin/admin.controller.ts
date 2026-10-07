import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import {
  AdminCreateUserDto,
  UpdateUserStatusDto,
  QueryAdminUsersDto,
  UpdateSystemLimitsDto,
  AdminCreateClassDto,
  QueryLogsDto,
  AdminCreateSchoolDto,
  AdminUpdateSchoolDto,
} from './dto/admin.dto';
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

  @Post('classes')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Admin tạo lớp học mới và phân công GVCN' })
  async createClass(@Body() dto: AdminCreateClassDto) {
    return this.adminService.createClass(dto);
  }

  @Get('system-limits')
  @ApiOperation({ summary: 'Xem các hạn mức cấu hình hệ thống' })
  async getSystemLimits() {
    return this.adminService.getSystemLimits();
  }

  @Put('system-limits')
  @ApiOperation({ summary: 'Cập nhật các hạn mức cấu hình hệ thống & Quota AI' })
  async updateSystemLimits(@Body() dto: UpdateSystemLimitsDto) {
    return this.adminService.updateSystemLimits(dto);
  }

  @Get('dashboard-stats')
  @ApiOperation({ summary: 'Thống kê tổng hợp toàn diện cho Admin Dashboard' })
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('logs/activities')
  @ApiOperation({ summary: 'Xem nhật ký hoạt động hệ thống toàn diện' })
  async getActivityLogs(@Query() query: QueryLogsDto) {
    return this.adminService.getActivityLogs(query);
  }

  @Get('logs/transactions')
  @ApiOperation({ summary: 'Xem lịch sử giao dịch và nộp học phí' })
  async getTransactionLogs(@Query() query: QueryLogsDto) {
    return this.adminService.getTransactionLogs(query);
  }

  @Get('schools')
  @ApiOperation({ summary: 'Lấy danh sách các trường học quản lý trong hệ thống' })
  async getSchools() {
    return this.adminService.getSchools();
  }

  @Post('schools')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Admin khởi tạo trường học mới vào danh mục hệ thống' })
  async createSchool(@Body() dto: AdminCreateSchoolDto) {
    return this.adminService.createSchool(dto);
  }

  @Put('schools/:id')
  @ApiOperation({ summary: 'Cập nhật thông tin trường học' })
  async updateSchool(
    @Param('id') id: string,
    @Body() dto: AdminUpdateSchoolDto,
  ) {
    return this.adminService.updateSchool(id, dto);
  }

  @Delete('schools/:id')
  @ApiOperation({ summary: 'Xóa trường học khỏi hệ thống' })
  async deleteSchool(@Param('id') id: string) {
    return this.adminService.deleteSchool(id);
  }
}



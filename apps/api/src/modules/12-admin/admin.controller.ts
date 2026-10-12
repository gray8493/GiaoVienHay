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
  UpdateAdminUserDto,
  UpdateUserStatusDto,
  UpdateTeacherAiQuotaDto,
  QueryAdminUsersDto,
  UpdateSystemLimitsDto,
  AdminCreateClassDto,
  QueryAdminClassesDto,
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

  @Put('users/:id')
  @ApiOperation({ summary: 'Cập nhật thông tin tài khoản người dùng' })
  async updateUser(
    @Param('id') userId: string,
    @Body() dto: UpdateAdminUserDto,
  ) {
    return this.adminService.updateUser(userId, dto);
  }

  @Patch('users/:id/status')
  @ApiOperation({ summary: 'Khóa hoặc kích hoạt lại tài khoản người dùng' })
  async updateUserStatus(
    @Param('id') userId: string,
    @Body() dto: UpdateUserStatusDto,
  ) {
    return this.adminService.updateUserStatus(userId, dto);
  }

  @Patch('users/:id/ban')
  @ApiOperation({ summary: 'Khóa tài khoản người dùng' })
  async banUser(
    @Param('id') userId: string,
    @Body() dto: Partial<UpdateUserStatusDto>,
  ) {
    return this.adminService.updateUserStatus(userId, {
      is_active: false,
      reason: dto?.reason,
    });
  }

  @Patch('users/:id/unban')
  @ApiOperation({ summary: 'Mở khóa tài khoản người dùng' })
  async unbanUser(
    @Param('id') userId: string,
    @Body() dto: Partial<UpdateUserStatusDto>,
  ) {
    return this.adminService.updateUserStatus(userId, {
      is_active: true,
      reason: dto?.reason,
    });
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Xóa mềm tài khoản người dùng (chuyển cờ isDeleted thành true)' })
  async deleteUser(@Param('id') userId: string) {
    return this.adminService.deleteUser(userId);
  }

  @Patch('users/:id/ai-quota')
  @ApiOperation({ summary: 'Điều chỉnh hạn mức AI của từng người dùng' })
  async updateTeacherAiQuota(
    @Param('id') userId: string,
    @Body() dto: UpdateTeacherAiQuotaDto,
  ) {
    return this.adminService.updateTeacherAiQuota(userId, dto);
  }

  @Get('classes')
  @ApiOperation({ summary: 'Giám sát toàn bộ các lớp học trong trường' })
  async getAllClassesMonitoring(@Query() query?: QueryAdminClassesDto) {
    return this.adminService.getAllClassesMonitoring(query);
  }

  @Post('classes')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Admin tạo lớp học mới và phân công GVCN' })
  async createClass(@Body() dto: AdminCreateClassDto) {
    return this.adminService.createClass(dto);
  }

  @Get(['system-limits', 'system/limits'])
  @ApiOperation({ summary: 'Xem các hạn mức cấu hình hệ thống' })
  async getSystemLimits() {
    return this.adminService.getSystemLimits();
  }

  @Put(['system-limits', 'system/limits'])
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

  @Get('classes')
  @ApiOperation({ summary: 'Lấy danh sách các lớp học phục vụ giám sát toàn hệ thống' })
  async getClasses() {
    return this.adminService.getAllClassesMonitoring();
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



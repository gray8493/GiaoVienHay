import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto, RegisterDeviceTokenDto } from './dto/users.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Lấy thông tin cá nhân của tài khoản đang đăng nhập' })
  async getMe(@CurrentUser('sub') userId: string) {
    return this.usersService.getMe(userId);
  }

  @Get('teachers/search')
  @ApiOperation({ summary: 'Tìm kiếm giáo viên trong hệ thống theo tên hoặc số điện thoại' })
  async searchTeachers(
    @Query('q') query?: string,
    @Query('subject_code') subjectCode?: string,
  ) {
    return this.usersService.searchTeachers(query, subjectCode);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Tra cứu thông tin hồ sơ người dùng theo ID' })
  @ApiParam({ name: 'id', example: 'usr_admin_root', description: 'Mã định danh người dùng (ví dụ: usr_admin_root, usr_01, usr_gv_01)' })
  async getUserById(@Param('id') userId: string) {
    return this.usersService.getUserProfileById(userId);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Cập nhật hồ sơ cá nhân (trường công tác, môn giảng dạy)' })
  async updateProfile(
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(userId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa mềm tài khoản người dùng theo ID' })
  @ApiParam({ name: 'id', example: 'usr_01', description: 'Mã định danh người dùng cần xóa' })
  async deleteUser(@Param('id') userId: string) {
    return this.usersService.deleteUser(userId);
  }

  @Post('device-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đăng ký Device Token FCM để nhận thông báo đẩy tức thời' })
  async registerDeviceToken(
    @CurrentUser('sub') userId: string,
    @Body() dto: RegisterDeviceTokenDto,
  ) {
    return this.usersService.registerDeviceToken(userId, dto);
  }
}

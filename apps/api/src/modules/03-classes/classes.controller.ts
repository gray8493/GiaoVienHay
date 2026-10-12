import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ClassesService } from './classes.service';
import {
  CreateClassDto,
  AddStudentToClassDto,
  JoinClassDto,
  UpdateSubjectTeachersDto,
} from './dto/classes.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Classes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Post()
  @Roles('TEACHER_*', 'ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Tạo lớp học mới (Giáo viên chủ nhiệm)' })
  async createClass(
    @CurrentUser('sub') teacherId: string,
    @CurrentUser('school_name') teacherSchool: string,
    @Body() dto: CreateClassDto,
  ) {
    return this.classesService.createClass(teacherId, teacherSchool, dto);
  }

  @Get()
  @Roles('TEACHER_*', 'ADMIN')
  @ApiOperation({ summary: 'Lấy danh sách các lớp học giáo viên đang phụ trách' })
  async getClasses(@CurrentUser('sub') teacherId: string) {
    return this.classesService.getMyClasses(teacherId);
  }

  @Get('my-classes')
  @Roles('TEACHER_*', 'ADMIN')
  @ApiOperation({ summary: 'Lấy danh sách các lớp học giáo viên đang phụ trách' })
  async getMyClasses(@CurrentUser('sub') teacherId: string) {
    return this.classesService.getMyClasses(teacherId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết lớp học và danh sách học sinh' })
  async getClassDetail(
    @Param('id') classId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.classesService.getClassDetail(classId, userId);
  }

  @Delete(':id')
  @Roles('TEACHER_*', 'ADMIN')
  @ApiOperation({ summary: 'Xóa mềm lớp học' })
  async deleteClass(
    @Param('id') classId: string,
    @CurrentUser('sub') teacherId: string,
  ) {
    return this.classesService.deleteClass(classId, teacherId);
  }

  @Get(':id/my-subject')
  @Roles('TEACHER_*')
  @ApiOperation({ summary: 'Xem môn học mà giáo viên phụ trách trong lớp' })
  async getMySubjectInClass(
    @Param('id') classId: string,
    @CurrentUser('sub') teacherId: string,
  ) {
    return this.classesService.getMySubjectInClass(classId, teacherId);
  }

  @Get(':id/invite')
  @Roles('TEACHER_*', 'ADMIN')
  @ApiOperation({ summary: 'Lấy mã mời và đường dẫn tham gia lớp học' })
  async getInviteCode(
    @Param('id') classId: string,
    @CurrentUser('sub') teacherId: string,
  ) {
    return this.classesService.getInviteCode(classId, teacherId);
  }

  @Post(':id/invite')
  @Roles('TEACHER_*', 'ADMIN')
  @ApiOperation({ summary: 'Tạo mã mời phụ huynh tham gia lớp học' })
  async generateInviteCode(
    @Param('id') classId: string,
    @CurrentUser('sub') teacherId: string,
  ) {
    return this.classesService.generateInviteCode(classId, teacherId);
  }

  @Post('join')
  @ApiOperation({ summary: 'Tham gia lớp học bằng mã mời' })
  async joinClassByInvite(
    @CurrentUser('sub') userId: string,
    @Body() dto: JoinClassDto,
  ) {
    return this.classesService.joinClassByInvite(userId, dto);
  }

  @Post(':id/students')
  @Roles('TEACHER_*', 'ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Thêm học sinh mới vào danh sách lớp' })
  async addStudent(
    @Param('id') classId: string,
    @Body() dto: AddStudentToClassDto,
  ) {
    return this.classesService.addStudent(classId, dto);
  }

  @Put(':id/subject-teachers')
  @Roles('TEACHER_*', 'ADMIN')
  @ApiOperation({ summary: 'Cập nhật phân công giáo viên bộ môn cho lớp học' })
  async updateSubjectTeachers(
    @Param('id') classId: string,
    @CurrentUser('sub') teacherId: string,
    @Body() dto: UpdateSubjectTeachersDto,
  ) {
    return this.classesService.updateSubjectTeachers(classId, teacherId, dto);
  }

  @Delete(':id/students/:studentId')
  @Roles('TEACHER_*', 'ADMIN')
  @ApiOperation({ summary: 'Xóa học sinh ra khỏi lớp học' })
  async removeStudent(
    @Param('id') classId: string,
    @Param('studentId') studentId: string,
  ) {
    return this.classesService.removeStudent(classId, studentId);
  }
}


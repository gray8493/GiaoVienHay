import { Controller, Get, Res } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { Response } from 'express';

@ApiExcludeController()
@Controller()
export class AppController {
  @Get()
  getRoot(@Res() res: Response) {
    // Tự động chuyển hướng từ trang gốc '/' sang giao diện Swagger UI '/api/docs'
    return res.redirect('/api/docs');
  }
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);
    const port = configService.get<number>('PORT') || 3000; // Đọc giá trị từ .env hoặc sử dụng mặc định là 3000
      // Áp dụng ValidationPipe vào toàn bộ ứng dụng
    app.useGlobalPipes(new ValidationPipe({
        transform: true, // Tự động chuyển đổi dữ liệu thành các loại tương ứng (e.g. string -> number)
        whitelist: true, // Chỉ cho phép các trường hợp hợp lệ trong DTO (loại bỏ các trường không khai báo)
        forbidNonWhitelisted: true, // Nếu có bất kỳ trường nào không hợp lệ, sẽ trả về lỗi
    }));
    await app.listen(port);
    console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();

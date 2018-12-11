import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { ModelModule } from '../model/model.module';
import { AppModule } from '../app.module';

describe('AuthService', () => {
  let service: AuthService;
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [AuthService],
    }).compile();
    service = module.get<AuthService>(AuthService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

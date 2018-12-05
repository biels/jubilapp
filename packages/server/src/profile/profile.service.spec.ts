import { Test, TestingModule } from '@nestjs/testing';
import { CalendarService } from './calendar.service';
import { ProfileService } from './profile.service';
import { ProfileModule } from './profile.module';
import { AppModule } from '../app.module';

describe('ProfileService', () => {
  let service: ProfileService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [ProfileService],
    }).compile();
    service = module.get<ProfileService>(ProfileService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Interests encoding', () => {
    it('encodes correctly', () => {
      const expected = '110000'
      const result = service.encodeInterests(['art', 'sports']);
      expect(result).toBe(expected)
    })
  })
});

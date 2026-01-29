import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as request from 'supertest';
import * as bcrypt from 'bcrypt';
import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';
import { UsersService } from '../src/users/users.service';
import { PrismaService } from '../src/prisma/prisma.service';

const ACCESS_SECRET = 'test-access';
const REFRESH_SECRET = 'test-refresh';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const passwordHash = await bcrypt.hash('demo1234', 10);

    const usersService = {
      findByEmail: jest.fn().mockResolvedValue({
        id: 'user-1',
        email: 'demo@pacto.app',
        passwordHash,
      }),
      findById: jest.fn().mockResolvedValue({
        id: 'user-1',
        email: 'demo@pacto.app',
      }),
    } as Partial<UsersService>;

    const prismaService = {
      refreshToken: {
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        findFirst: jest.fn(),
      },
      user: {
        create: jest.fn(),
      },
    } as Partial<PrismaService>;

    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: PrismaService, useValue: prismaService },
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => {
              if (key === 'JWT_ACCESS_SECRET') return ACCESS_SECRET;
              if (key === 'JWT_REFRESH_SECRET') return REFRESH_SECRET;
              return undefined;
            },
          },
        },
        { provide: JwtService, useValue: new JwtService({}) },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('logs in and returns tokens', async () => {
    const response = await request(app.getHttpServer()).post('/auth/login').send({
      email: 'demo@pacto.app',
      password: 'demo1234',
    });

    expect(response.status).toBe(201);
    expect(response.body.accessToken).toBeDefined();
    expect(response.body.refreshToken).toBeDefined();
    expect(response.body.user.email).toBe('demo@pacto.app');
  });
});

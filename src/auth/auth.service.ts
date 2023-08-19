import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

import { ExceptionHandler } from '../common/helpers';
import { User } from '../users/entities/user.entity';
import { SignInDto, SignUpDto } from './dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RefreshToken } from './entities/refresh-token.entity';
import { AuthResponse, JwtPayload } from './interfaces/auth.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,

    private readonly jwtService: JwtService,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<AuthResponse> {
    try {
      const { password, ...userData } = signUpDto;
      const user = this.usersRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
      });

      await this.usersRepository.save(user);
      delete user.password;

      const token = this.createToken(user.id);

      await this.refreshTokenRepository.save({ user, token });

      return { token, user };
    } catch (error) {
      ExceptionHandler(error);
    }
  }

  async signIn({ email, password }: SignInDto): Promise<AuthResponse> {
    const user = await this.usersRepository.findOneBy({ email });

    if (!user) throw new BadRequestException('Invalid credentials');

    if (!bcrypt.compareSync(password, user.password)) throw new BadRequestException('Invalid credentials');

    delete user.password;

    const token = this.createToken(user.id);
    await this.refreshTokenRepository.save({ user, token });

    return { token, user };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<AuthResponse> {
    const { token } = refreshTokenDto;
    const { id, exp } = this.jwtService.verify(token) as JwtPayload;

    const user = await this.validateUser(id);

    const storedToken = await this.refreshTokenRepository.findOneBy({ user: { id: user.id }, token });

    if (!storedToken) throw new UnauthorizedException(`Invalid refresh token`);

    if (!this.tokenIsAboutToExpire(exp)) throw new BadRequestException(`Token is not about to expire`);

    await this.deleteRefreshToken(user.id);

    const newToken = this.createToken(user.id);

    await this.refreshTokenRepository.save({ user, token: newToken });

    return { token: newToken, user };
  }

  async validateUser(id: string): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id });

    if (user.deletedAt) throw new UnauthorizedException(`User is inactive, please contact support`);

    delete user.password;

    return user;
  }

  private createToken(id: string) {
    return this.jwtService.sign({ id });
  }

  private async deleteRefreshToken(id: string) {
    await this.refreshTokenRepository.delete({ user: { id } });
  }

  private tokenIsAboutToExpire(exp: number): boolean {
    const currentTimestamp = Math.floor(Date.now() / 1000); // Convert current datetime to UNIX timestamp (seconds)
    const timeUntilExpiration = exp - currentTimestamp;

    return timeUntilExpiration <= 3600; // 1 hour
  }
}

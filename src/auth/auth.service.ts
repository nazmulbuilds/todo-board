import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

import { User } from "../users/schema";
import { UsersService } from "../users/users.service";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async getUserById(userId: string) {
    return this.usersService.findById(userId);
  }

  async validateUser(email: string, password: string) {
    return this.usersService.validateUserCredentials(email, password);
  }

  async createAccessToken(user: User) {
    const payload = { userId: user.id };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}

import { Controller, HttpCode, HttpStatus, Post, Request, UseGuards } from "@nestjs/common";
import { ApiBody, ApiOkResponse, ApiProperty, ApiTags } from "@nestjs/swagger";

import { SelectUsersDto } from "../users/schema";
import { AuthService } from "./auth.service";
import { LocalAuthGuard } from "./local-auth.guard";

class LoginDto {
  @ApiProperty({
    description: "User email",
    example: "user@example.com",
  })
  email!: string;

  @ApiProperty({
    description: "User password",
    example: "password123",
  })
  password!: string;
}

class LoginResponseDto {
  @ApiProperty({
    description: "JWT access token",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  })
  accessToken!: string;

  @ApiProperty({
    description: "User information",
    type: SelectUsersDto,
  })
  user!: typeof SelectUsersDto;
}

@Controller("authentication")
@ApiTags("Authentication Section")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post("/")
  @HttpCode(HttpStatus.OK)
  @ApiBody({
    type: LoginDto,
  })
  @ApiOkResponse({
    type: LoginResponseDto,
    description: "User successfully logged in",
  })
  async login(@Request() req) {
    const { accessToken } = await this.authService.createAccessToken(req.user);

    return { accessToken, user: req.user };
  }
}

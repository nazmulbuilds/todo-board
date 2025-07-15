import { Body, Controller, Get, Post, Request, UseGuards } from "@nestjs/common";
import { ApiBadRequestResponse, ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from "@nestjs/swagger";

import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { generateBadRequestExample } from "../utils/generate-open-api-example";
import { CreateUsersDto, SelectUsersDto } from "./schema";
import { UsersService } from "./users.service";

@Controller("users")
@ApiTags("Users Section")
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  @Post("/registration")
  @ApiCreatedResponse({ type: SelectUsersDto, description: "Create user" })
  @ApiBadRequestResponse(generateBadRequestExample(CreateUsersDto.schema))
  async registration(@Body() body: CreateUsersDto) {
    return this.usersService.create(body);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: SelectUsersDto, description: "Get logged in user" })
  @Get("/me")
  async me(@Request() req) {
    return this.usersService.findById(
      `${req.user.id}`,
    );
  }
}

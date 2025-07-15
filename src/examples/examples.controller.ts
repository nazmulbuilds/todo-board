import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ApiBadRequestResponse, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { ZodSerializerDto } from "nestjs-zod";

import { generateBadRequestExample, generateNotFoundExample } from "../utils/generate-open-api-example";
import { ExmaplesService } from "./examples.service";
import { InsertExamplesDto, SelectExamplesDto } from "./schema";

@Controller("examples")
@ApiTags("Examples Section")
// @ApiBearerAuth()
export class ExamplesController {
  constructor(private readonly examplesService: ExmaplesService) {}

  @Post()
  @ApiCreatedResponse({ type: SelectExamplesDto, description: "Create example" })
  @ApiBadRequestResponse(generateBadRequestExample(InsertExamplesDto.schema))
  createExample(@Body() body: InsertExamplesDto) {
    return this.examplesService.create(body);
  }

  @Get()
  @ApiOkResponse({ type: [SelectExamplesDto], description: "Get all examples" })
  getAll() {
    return this.examplesService.getAll();
  }

  @Get(":id")
  @ZodSerializerDto(SelectExamplesDto)
  @ApiOkResponse({ type: SelectExamplesDto, description: "Get a example by ID" })
  @ApiNotFoundResponse(generateNotFoundExample("Example"))
  getById(@Param("id") id: string) {
    return this.examplesService.getById(id);
  }
}

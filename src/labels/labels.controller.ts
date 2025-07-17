import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiBadRequestResponse, ApiBearerAuth, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags } from "@nestjs/swagger";

import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { generateBadRequestExample, generateNotFoundExample } from "../utils/generate-open-api-example";
import { LabelsService } from "./labels.service";
import { InsertLabelsDto, SelectLabelsDto, UpdateLabelsDto } from "./schema";

@Controller("labels")
@ApiTags("Labels Section")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LabelsController {
  constructor(private readonly labelsService: LabelsService) {}

  @Post()
  @ApiCreatedResponse({ type: SelectLabelsDto, description: "Create label" })
  @ApiBadRequestResponse(generateBadRequestExample(InsertLabelsDto.schema))
  createLabel(@Body() body: InsertLabelsDto) {
    return this.labelsService.create(body);
  }

  @Get()
  @ApiOkResponse({ type: [SelectLabelsDto], description: "Get all labels" })
  getAll() {
    return this.labelsService.getAll();
  }

  @Patch(":id")
  @ApiOkResponse({ type: SelectLabelsDto, description: "Update label" })
  @ApiBadRequestResponse(generateBadRequestExample(UpdateLabelsDto.schema))
  @ApiNotFoundResponse(generateNotFoundExample("Label"))
  updateLabel(@Param("id") id: string, @Body() body: UpdateLabelsDto) {
    return this.labelsService.update(id, body);
  }

  @Delete(":id")
  @ApiOkResponse({ description: "Delete label" })
  @ApiNotFoundResponse(generateNotFoundExample("Label"))
  deleteLabel(@Param("id") id: string) {
    return this.labelsService.delete(id);
  }
}

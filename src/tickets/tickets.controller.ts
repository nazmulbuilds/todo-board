import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiBadRequestResponse, ApiBearerAuth, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags } from "@nestjs/swagger";

import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { generateBadRequestExample, generateNotFoundExample } from "../utils/generate-open-api-example";
import { InsertTicketsDto, SelectTicketsDto, UpdateTicketsDto } from "./schema";
import { TicketsService } from "./tickets.service";

@Controller("tickets")
@ApiTags("Tickets Section")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  @ApiCreatedResponse({ type: SelectTicketsDto, description: "Create ticket" })
  @ApiBadRequestResponse(generateBadRequestExample(InsertTicketsDto.schema))
  createTicket(@Body() body: InsertTicketsDto) {
    return this.ticketsService.create(body);
  }

  @Get()
  @ApiOkResponse({ type: [SelectTicketsDto], description: "Get all tickets" })
  getAll() {
    return this.ticketsService.getAll();
  }

  @Patch(":id")
  @ApiOkResponse({ type: SelectTicketsDto, description: "Update ticket" })
  @ApiBadRequestResponse(generateBadRequestExample(UpdateTicketsDto.schema))
  @ApiNotFoundResponse(generateNotFoundExample("Ticket"))
  updateTicket(@Param("id") id: string, @Body() body: UpdateTicketsDto) {
    return this.ticketsService.update(id, body);
  }

  @Delete(":id")
  @ApiOkResponse({ description: "Delete label" })
  @ApiNotFoundResponse(generateNotFoundExample("Label"))
  deleteTicket(@Param("id") id: string) {
    return this.ticketsService.delete(id);
  }
}

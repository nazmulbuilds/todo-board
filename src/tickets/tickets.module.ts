import { forwardRef, Module } from "@nestjs/common";

import { CategoriesModule } from "../categories/categories.module";
import { LabelsModule } from "../labels/labels.module";
import { TicketsController } from "./tickets.controller";
import { TicketsService } from "./tickets.service";

@Module({
  imports: [LabelsModule, forwardRef(() => CategoriesModule)],
  controllers: [TicketsController],
  providers: [TicketsService],
  exports: [TicketsService],
})
export class TicketsModule {}

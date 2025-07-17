import { forwardRef, Module } from "@nestjs/common";

import { TicketsModule } from "../tickets/tickets.module";
import { CategoriesController } from "./categories.controller";
import { CategoriesService } from "./categories.service";

@Module({
  imports: [forwardRef(() => TicketsModule)],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}

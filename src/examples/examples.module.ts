import { Module } from "@nestjs/common";

import { ExamplesController } from "./examples.controller";
import { ExmaplesService } from "./examples.service";

@Module({
  controllers: [ExamplesController],
  providers: [ExmaplesService],
})
export class ExamplesModule {}

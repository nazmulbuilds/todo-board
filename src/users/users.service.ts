import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { sha256 } from "js-sha256";

import { DATABASE_CONNECTION } from "../database/database-connection";
import * as schema from "./schema";

@Injectable()
export class UsersService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async create(data: schema.CreateUsersDto): Promise<schema.UserWithoutPassword> {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(sha256(data.password), salt);
    const [insertedRow] = await this.db.insert(schema.users).values({
      ...data,
      password: hash,
    }).returning();

    const { password, ...userWithoutPassword } = insertedRow;
    return userWithoutPassword;
  }

  async findById(id: string): Promise<schema.UserWithoutPassword> {
    const user = await this.db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, Number(id)),
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async validateUserCredentials(email: string, password: string): Promise<schema.UserWithoutPassword | null> {
    const user = await this.db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email),
    });

    if (!user) {
      return null;
    }

    const valid = await bcrypt.compare(
      sha256(password),
      user.password,
    );

    if (!valid) {
      return null;
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

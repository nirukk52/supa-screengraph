import { PrismaClient } from "./generated/client";

const prismaClientSingleton = () => {
	return new PrismaClient();
};

declare global {
	var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
	namespace PrismaJson {
		type ChatMessages = Array<{
			role: "user" | "assistant" | "system";
			parts: Array<{
				type: "text" | "image";
				text?: string;
			}>;
		}>;
	}
}

// biome-ignore lint/suspicious/noRedeclare: This is a singleton
const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
	globalThis.prisma = prisma;
}

export { prisma as db };

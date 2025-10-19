
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const client_1 = require("./generated/client");
const prismaClientSingleton = () => {
	return new client_1.PrismaClient();
};
// biome-ignore lint/suspicious/noRedeclare: This is a singleton
const prisma = globalThis.prisma ?? prismaClientSingleton();
exports.db = prisma;
if (process.env.NODE_ENV !== "production") {
	globalThis.prisma = prisma;
}

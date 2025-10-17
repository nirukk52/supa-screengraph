Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsers = getUsers;
exports.countAllUsers = countAllUsers;
exports.getUserById = getUserById;
exports.getUserByEmail = getUserByEmail;
exports.createUser = createUser;
exports.getAccountById = getAccountById;
exports.createUserAccount = createUserAccount;
exports.updateUser = updateUser;
const client_1 = require("../client");
async function getUsers({ limit, offset, query }) {
	return await client_1.db.user.findMany({
		where: query
			? {
					name: {
						contains: query,
					},
				}
			: undefined,
		take: limit,
		skip: offset,
	});
}
async function countAllUsers() {
	return await client_1.db.user.count();
}
async function getUserById(id) {
	return await client_1.db.user.findUnique({
		where: {
			id,
		},
	});
}
async function getUserByEmail(email) {
	return await client_1.db.user.findUnique({
		where: {
			email,
		},
	});
}
async function createUser({
	email,
	name,
	role,
	emailVerified,
	onboardingComplete,
}) {
	return await client_1.db.user.create({
		data: {
			email,
			name,
			role,
			emailVerified,
			onboardingComplete,
			createdAt: new Date(),
			updatedAt: new Date(),
		},
	});
}
async function getAccountById(id) {
	return await client_1.db.account.findUnique({
		where: {
			id,
		},
	});
}
async function createUserAccount({
	userId,
	providerId,
	accountId,
	hashedPassword,
}) {
	return await client_1.db.account.create({
		data: {
			userId,
			accountId,
			providerId,
			password: hashedPassword,
			createdAt: new Date(),
			updatedAt: new Date(),
		},
	});
}
async function updateUser(user) {
	return await client_1.db.user.update({
		where: {
			id: user.id,
		},
		data: user,
	});
}

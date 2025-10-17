Object.defineProperty(exports, "__esModule", { value: true });
exports.getAiChatsByUserId = getAiChatsByUserId;
exports.getAiChatsByOrganizationId = getAiChatsByOrganizationId;
exports.getAiChatById = getAiChatById;
exports.createAiChat = createAiChat;
exports.updateAiChat = updateAiChat;
exports.deleteAiChat = deleteAiChat;
const client_1 = require("../client");
async function getAiChatsByUserId({ limit, offset, userId }) {
	return await client_1.db.aiChat.findMany({
		where: {
			userId,
		},
		take: limit,
		skip: offset,
	});
}
async function getAiChatsByOrganizationId({ limit, offset, organizationId }) {
	return await client_1.db.aiChat.findMany({
		where: {
			organizationId,
		},
		take: limit,
		skip: offset,
	});
}
async function getAiChatById(id) {
	return await client_1.db.aiChat.findUnique({
		where: {
			id,
		},
	});
}
async function createAiChat({ organizationId, userId, title }) {
	return await client_1.db.aiChat.create({
		data: {
			organizationId,
			userId,
			title,
		},
	});
}
async function updateAiChat({ id, title, messages }) {
	return await client_1.db.aiChat.update({
		where: {
			id,
		},
		data: {
			title,
			messages,
		},
	});
}
async function deleteAiChat(id) {
	return await client_1.db.aiChat.delete({
		where: {
			id,
		},
	});
}


Object.defineProperty(exports, "__esModule", { value: true });
exports.getPurchaseById = getPurchaseById;
exports.getPurchasesByOrganizationId = getPurchasesByOrganizationId;
exports.getPurchasesByUserId = getPurchasesByUserId;
exports.getPurchaseBySubscriptionId = getPurchaseBySubscriptionId;
exports.createPurchase = createPurchase;
exports.updatePurchase = updatePurchase;
exports.deletePurchaseBySubscriptionId = deletePurchaseBySubscriptionId;
const client_1 = require("../client");
async function getPurchaseById(id) {
	return client_1.db.purchase.findUnique({
		where: { id },
	});
}
async function getPurchasesByOrganizationId(organizationId) {
	return client_1.db.purchase.findMany({
		where: {
			organizationId,
		},
	});
}
async function getPurchasesByUserId(userId) {
	return client_1.db.purchase.findMany({
		where: {
			userId,
		},
	});
}
async function getPurchaseBySubscriptionId(subscriptionId) {
	return client_1.db.purchase.findFirst({
		where: {
			subscriptionId,
		},
	});
}
async function createPurchase(purchase) {
	const created = await client_1.db.purchase.create({
		data: purchase,
	});
	return getPurchaseById(created.id);
}
async function updatePurchase(purchase) {
	const updated = await client_1.db.purchase.update({
		where: {
			id: purchase.id,
		},
		data: purchase,
	});
	return getPurchaseById(updated.id);
}
async function deletePurchaseBySubscriptionId(subscriptionId) {
	await client_1.db.purchase.delete({
		where: {
			subscriptionId,
		},
	});
}


Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrganizations = getOrganizations;
exports.countAllOrganizations = countAllOrganizations;
exports.getOrganizationById = getOrganizationById;
exports.getInvitationById = getInvitationById;
exports.getOrganizationBySlug = getOrganizationBySlug;
exports.getOrganizationMembership = getOrganizationMembership;
exports.getOrganizationWithPurchasesAndMembersCount =
	getOrganizationWithPurchasesAndMembersCount;
exports.getPendingInvitationByEmail = getPendingInvitationByEmail;
exports.updateOrganization = updateOrganization;
const client_1 = require("../client");
async function getOrganizations({ limit, offset, query }) {
	return client_1.db.organization
		.findMany({
			where: {
				name: { contains: query, mode: "insensitive" },
			},
			include: {
				_count: {
					select: {
						members: true,
					},
				},
			},
			take: limit,
			skip: offset,
		})
		.then((res) =>
			res.map((org) => ({
				...org,
				membersCount: org._count.members,
			})),
		);
}
async function countAllOrganizations() {
	return client_1.db.organization.count();
}
async function getOrganizationById(id) {
	return client_1.db.organization.findUnique({
		where: { id },
		include: {
			members: true,
			invitations: true,
		},
	});
}
async function getInvitationById(id) {
	return client_1.db.invitation.findUnique({
		where: { id },
		include: {
			organization: true,
		},
	});
}
async function getOrganizationBySlug(slug) {
	return client_1.db.organization.findUnique({
		where: { slug },
	});
}
async function getOrganizationMembership(organizationId, userId) {
	return client_1.db.member.findUnique({
		where: {
			organizationId_userId: {
				organizationId,
				userId,
			},
		},
		include: {
			organization: true,
		},
	});
}
async function getOrganizationWithPurchasesAndMembersCount(organizationId) {
	const organization = await client_1.db.organization.findUnique({
		where: {
			id: organizationId,
		},
		include: {
			purchases: true,
			_count: {
				select: {
					members: true,
				},
			},
		},
	});
	return organization
		? {
				...organization,
				membersCount: organization._count.members,
			}
		: null;
}
async function getPendingInvitationByEmail(email) {
	return client_1.db.invitation.findFirst({
		where: {
			email,
			status: "pending",
		},
	});
}
async function updateOrganization(organization) {
	return client_1.db.organization.update({
		where: {
			id: organization.id,
		},
		data: organization,
	});
}

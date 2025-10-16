interface OrganizationMember {
	userId: string;
	role: string;
}

interface BasicOrganization {
	members: OrganizationMember[];
}

export function isOrganizationAdmin(
	organization?: BasicOrganization | null,
	user?: {
		id: string;
		role?: string | null;
	} | null,
) {
	const userOrganizationRole = organization?.members.find(
		(member) => member.userId === user?.id,
	)?.role;

	return (
		["owner", "admin"].includes(userOrganizationRole ?? "") ||
		user?.role === "admin"
	);
}

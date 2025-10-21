var __awaiter =
	(this && this.__awaiter) ||
	((thisArg, _arguments, P, generator) => {
		function adopt(value) {
			return value instanceof P
				? value
				: new P((resolve) => {
						resolve(value);
					});
		}
		return new (P || (P = Promise))((resolve, reject) => {
			function fulfilled(value) {
				try {
					step(generator.next(value));
				} catch (e) {
					reject(e);
				}
			}
			function rejected(value) {
				try {
					step(generator["throw"](value));
				} catch (e) {
					reject(e);
				}
			}
			function step(result) {
				result.done
					? resolve(result.value)
					: adopt(result.value).then(fulfilled, rejected);
			}
			step(
				(generator = generator.apply(thisArg, _arguments || [])).next(),
			);
		});
	});
import { getOrganizationWithPurchasesAndMembersCount } from "@repo/database";
import { logger } from "@repo/logs";
// Payments temporarily disabled
const setSubscriptionSeats = (_args) =>
	__awaiter(void 0, void 0, void 0, function* () {});
export function updateSeatsInOrganizationSubscription(organizationId) {
	return __awaiter(this, void 0, void 0, function* () {
		const organization =
			yield getOrganizationWithPurchasesAndMembersCount(organizationId);
		if (
			!(organization === null || organization === void 0
				? void 0
				: organization.purchases.length)
		) {
			return;
		}
		const activeSubscription = organization.purchases.find(
			(purchase) => purchase.type === "SUBSCRIPTION",
		);
		if (
			!(activeSubscription === null || activeSubscription === void 0
				? void 0
				: activeSubscription.subscriptionId)
		) {
			return;
		}
		try {
			yield setSubscriptionSeats({
				id: activeSubscription.subscriptionId,
				seats: organization.membersCount,
			});
		} catch (error) {
			logger.error(
				"Could not update seats in organization subscription",
				{
					organizationId,
					error,
				},
			);
		}
	});
}

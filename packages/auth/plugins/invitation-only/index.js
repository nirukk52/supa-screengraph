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
import { config } from "@repo/config";
import { getPendingInvitationByEmail } from "@repo/database";
import { APIError } from "better-auth/api";
import { createAuthMiddleware } from "better-auth/plugins";
export const invitationOnlyPlugin = () => ({
	id: "invitationOnlyPlugin",
	hooks: {
		before: [
			{
				matcher: (context) => context.path.startsWith("/sign-up/email"),
				handler: createAuthMiddleware((ctx) =>
					__awaiter(void 0, void 0, void 0, function* () {
						if (config.auth.enableSignup) {
							return;
						}
						const { email } = ctx.body;
						// check if there is an invitation for the email
						const hasInvitation =
							yield getPendingInvitationByEmail(email);
						if (!hasInvitation) {
							throw new APIError("BAD_REQUEST", {
								code: "INVALID_INVITATION",
								message: "No invitation found for this email",
							});
						}
					}),
				),
			},
		],
	},
	$ERROR_CODES: {
		INVALID_INVITATION: "No invitation found for this email",
	},
});

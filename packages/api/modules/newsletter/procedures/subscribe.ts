import { ORPCError } from "@orpc/client";
import { logger } from "@repo/logs";
import { sendEmail } from "@repo/mail";
import z from "zod";
import { publicProcedure } from "../../../orpc/base";

export const subscribe = publicProcedure
	.input(
		z.object({
			email: z.string().email(),
		}),
	)
	.handler(async ({ input, context: { locale } }) => {
		const { email } = input;

		try {
			// ... add your crm or email service integration here to store the email of the user

			await sendEmail({
				to: email,
				locale,
				templateId: "newsletterSignup",
				context: {},
			});
		} catch (error) {
			logger.error(error);
			throw new ORPCError("INTERNAL_SERVER_ERROR");
		}
	});

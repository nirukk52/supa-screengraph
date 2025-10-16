import { ORPCError } from "@orpc/client";
import { config } from "@repo/config";
import { logger } from "@repo/logs";

// Mail temporarily disabled
const sendEmail = async (..._args: any[]) => {};

import { localeMiddleware } from "../../../orpc/middleware/locale-middleware";
import { publicProcedure } from "../../../orpc/procedures";
import { contactFormSchema } from "../types";

export const submitContactForm = publicProcedure
	.route({
		method: "POST",
		path: "/contact",
		tags: ["Contact"],
		summary: "Submit contact form",
	})
	.input(contactFormSchema)
	.use(localeMiddleware)
	.handler(
		async ({ input: { email, name, message }, context: { locale } }) => {
			try {
				await sendEmail({
					to: config.contactForm.to,
					locale,
					subject: config.contactForm.subject,
					text: `Name: ${name}\n\nEmail: ${email}\n\nMessage: ${message}`,
				});
			} catch (error) {
				logger.error(error);
				throw new ORPCError("INTERNAL_SERVER_ERROR");
			}
		},
	);

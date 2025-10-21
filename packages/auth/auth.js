var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { config } from "@repo/config";
import { db, getInvitationById, getPurchasesByOrganizationId, getPurchasesByUserId, getUserByEmail, } from "@repo/database";
import { logger } from "@repo/logs";
// Mail/Payments temporarily disabled
const sendEmail = (..._args) => __awaiter(void 0, void 0, void 0, function* () { });
const cancelSubscription = (..._args) => __awaiter(void 0, void 0, void 0, function* () { });
import { getBaseUrl } from "@repo/utils";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin, createAuthMiddleware, magicLink, openAPI, organization, twoFactor, username, } from "better-auth/plugins";
import { passkey } from "better-auth/plugins/passkey";
import { parse as parseCookies } from "cookie";
import { updateSeatsInOrganizationSubscription } from "./lib/organization";
import { invitationOnlyPlugin } from "./plugins/invitation-only";
const getLocaleFromRequest = (request) => {
    var _a, _b;
    const cookies = parseCookies((_a = request === null || request === void 0 ? void 0 : request.headers.get("cookie")) !== null && _a !== void 0 ? _a : "");
    return ((_b = cookies[config.i18n.localeCookieName]) !== null && _b !== void 0 ? _b : config.i18n.defaultLocale);
};
const appUrl = getBaseUrl();
export const auth = betterAuth({
    baseURL: appUrl,
    trustedOrigins: [appUrl],
    appName: config.appName,
    database: prismaAdapter(db, {
        provider: "postgresql",
    }),
    advanced: {
        database: {
            generateId: false,
        },
    },
    session: {
        expiresIn: config.auth.sessionCookieMaxAge,
        freshAge: 0,
    },
    account: {
        accountLinking: {
            enabled: true,
            trustedProviders: ["google", "github"],
        },
    },
    hooks: {
        after: createAuthMiddleware((ctx) => __awaiter(void 0, void 0, void 0, function* () {
            if (ctx.path.startsWith("/organization/accept-invitation")) {
                const { invitationId } = ctx.body;
                if (!invitationId) {
                    return;
                }
                const invitation = yield getInvitationById(invitationId);
                if (!invitation) {
                    return;
                }
                yield updateSeatsInOrganizationSubscription(invitation.organizationId);
            }
            else if (ctx.path.startsWith("/organization/remove-member")) {
                const { organizationId } = ctx.body;
                if (!organizationId) {
                    return;
                }
                yield updateSeatsInOrganizationSubscription(organizationId);
            }
        })),
        before: createAuthMiddleware((ctx) => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            if (ctx.path.startsWith("/delete-user") ||
                ctx.path.startsWith("/organization/delete")) {
                const userId = (_a = ctx.context.session) === null || _a === void 0 ? void 0 : _a.session.userId;
                const { organizationId } = ctx.body;
                if (userId || organizationId) {
                    const purchases = organizationId
                        ? yield getPurchasesByOrganizationId(organizationId)
                        : // biome-ignore lint/style/noNonNullAssertion: This is a valid case
                            yield getPurchasesByUserId(userId);
                    const subscriptions = purchases.filter((purchase) => purchase.type === "SUBSCRIPTION" &&
                        purchase.subscriptionId !== null);
                    if (subscriptions.length > 0) {
                        for (const subscription of subscriptions) {
                            yield cancelSubscription(
                            // biome-ignore lint/style/noNonNullAssertion: This is a valid case
                            subscription.subscriptionId);
                        }
                    }
                }
            }
        })),
    },
    user: {
        additionalFields: {
            onboardingComplete: {
                type: "boolean",
                required: false,
            },
            locale: {
                type: "string",
                required: false,
            },
        },
        deleteUser: {
            enabled: true,
        },
        changeEmail: {
            enabled: true,
            sendChangeEmailVerification: (_a, request_1) => __awaiter(void 0, [_a, request_1], void 0, function* ({ user: { email, name }, url }, request) {
                const locale = getLocaleFromRequest(request);
                yield sendEmail({
                    to: email,
                    templateId: "emailVerification",
                    context: {
                        url,
                        name,
                    },
                    locale,
                });
            }),
        },
    },
    emailAndPassword: {
        enabled: true,
        // If signup is disabled, the only way to sign up is via an invitation. So in this case we can auto sign in the user, as the email is already verified by the invitation.
        // If signup is enabled, we can't auto sign in the user, as the email is not verified yet.
        autoSignIn: !config.auth.enableSignup,
        requireEmailVerification: config.auth.enableSignup,
        sendResetPassword: (_a, request_1) => __awaiter(void 0, [_a, request_1], void 0, function* ({ user, url }, request) {
            const locale = getLocaleFromRequest(request);
            yield sendEmail({
                to: user.email,
                templateId: "forgotPassword",
                context: {
                    url,
                    name: user.name,
                },
                locale,
            });
        }),
    },
    emailVerification: {
        sendOnSignUp: config.auth.enableSignup,
        autoSignInAfterVerification: true,
        sendVerificationEmail: (_a, request_1) => __awaiter(void 0, [_a, request_1], void 0, function* ({ user: { email, name }, url }, request) {
            const locale = getLocaleFromRequest(request);
            yield sendEmail({
                to: email,
                templateId: "emailVerification",
                context: {
                    url,
                    name,
                },
                locale,
            });
        }),
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            scope: ["email", "profile"],
        },
        github: {
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            scope: ["user:email"],
        },
    },
    plugins: [
        username(),
        admin(),
        passkey(),
        magicLink({
            disableSignUp: false,
            sendMagicLink: (_a, request_1) => __awaiter(void 0, [_a, request_1], void 0, function* ({ email, url }, request) {
                const locale = getLocaleFromRequest(request);
                yield sendEmail({
                    to: email,
                    templateId: "magicLink",
                    context: {
                        url,
                    },
                    locale,
                });
            }),
        }),
        organization({
            sendInvitationEmail: (_a, request_1) => __awaiter(void 0, [_a, request_1], void 0, function* ({ email, id, organization }, request) {
                const locale = getLocaleFromRequest(request);
                const existingUser = yield getUserByEmail(email);
                const url = new URL(existingUser ? "/auth/login" : "/auth/signup", getBaseUrl());
                url.searchParams.set("invitationId", id);
                url.searchParams.set("email", email);
                yield sendEmail({
                    to: email,
                    templateId: "organizationInvitation",
                    locale,
                    context: {
                        organizationName: organization.name,
                        url: url.toString(),
                    },
                });
            }),
        }),
        openAPI(),
        invitationOnlyPlugin(),
        twoFactor(),
    ],
    onAPIError: {
        onError(error, ctx) {
            logger.error(error, { ctx });
        },
    },
});
export * from "./lib/organization";

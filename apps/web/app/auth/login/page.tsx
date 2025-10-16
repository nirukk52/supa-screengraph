import { LoginForm } from "@saas/auth/components/LoginForm";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations();

	return {
		title: t("auth.login.title"),
	};
}

export default function LoginPage() {
	return <LoginForm />;
}

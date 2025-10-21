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
import deepmerge from "deepmerge";
export const importLocale = (locale) =>
	__awaiter(void 0, void 0, void 0, function* () {
		return (yield import(`../translations/${locale}.json`)).default;
	});
export const getMessagesForLocale = (locale) =>
	__awaiter(void 0, void 0, void 0, function* () {
		const localeMessages = yield importLocale(locale);
		if (locale === config.i18n.defaultLocale) {
			return localeMessages;
		}
		const defaultLocaleMessages = yield importLocale(
			config.i18n.defaultLocale,
		);
		return deepmerge(defaultLocaleMessages, localeMessages);
	});

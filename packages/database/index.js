var __createBinding =
	(this && this.__createBinding) ||
	(Object.create
		? (o, m, k, k2) => {
				const lk2 = k2 ?? k;
				var desc = Object.getOwnPropertyDescriptor(m, k);
				if (
					!desc ||
					("get" in desc
						? !m.__esModule
						: desc.writable || desc.configurable)
				) {
					desc = {
						enumerable: true,
						get: () => m[k],
					};
				}
				Object.defineProperty(o, lk2, desc);
			}
		: (o, m, k, k2) => {
				const lk2 = k2 ?? k;
				o[lk2] = m[k];
			});
var __exportStar =
	(this && this.__exportStar) ||
	((m, exports) => {
		for (var p in m) {
			if (p !== "default" && !Object.hasOwn(exports, p)) {
				__createBinding(exports, m, p);
			}
		}
	});
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./prisma"), exports);

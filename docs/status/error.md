Run node tooling/scripts/pr-check.mjs
Toolchain: node v20.19.5 | pnpm 10.14.0

$ pnpm install --recursive --frozen-lockfile
Scope: all 23 workspace projects
Lockfile is up to date, resolution step is skipped
Progress: resolved 1, reused 0, downloaded 0, added 0
.                                        |    +1867 ++++++++++++++++++++++++++++
Progress: resolved 1867, reused 2, downloaded 61, added 23
Progress: resolved 1867, reused 2, downloaded 170, added 136
Progress: resolved 1867, reused 2, downloaded 188, added 144
Progress: resolved 1867, reused 2, downloaded 360, added 337
Progress: resolved 1867, reused 2, downloaded 492, added 478
Progress: resolved 1867, reused 2, downloaded 561, added 514
Progress: resolved 1867, reused 2, downloaded 794, added 792
Progress: resolved 1867, reused 2, downloaded 1110, added 1093
Progress: resolved 1867, reused 2, downloaded 1281, added 1282
Progress: resolved 1867, reused 2, downloaded 1398, added 1359
Progress: resolved 1867, reused 2, downloaded 1491, added 1412
Progress: resolved 1867, reused 2, downloaded 1779, added 1778
Progress: resolved 1867, reused 2, downloaded 1864, added 1867, done
. prepare$ husky
. prepare: Done
Done in 14.8s using pnpm v10.14.0

$ pnpm --filter @repo/database exec prisma --version
Prisma schema loaded from prisma/schema.prisma
prisma                  : 6.17.1
@prisma/client          : 6.16.2
Computed binaryTarget   : debian-openssl-3.0.x
Operating System        : linux
Architecture            : x64
Node.js                 : v20.19.5
TypeScript              : 5.9.3
Query Engine (Node-API) : libquery-engine 272a37d34178c2894197e17273bf937f25acdeac (at ../../node_modules/.pnpm/@prisma+engines@6.17.1/node_modules/@prisma/engines/libquery_engine-debian-openssl-3.0.x.so.node)
PSL                     : @prisma/prisma-schema-wasm 6.17.1-1.272a37d34178c2894197e17273bf937f25acdeac
Schema Engine           : schema-engine-cli 272a37d34178c2894197e17273bf937f25acdeac (at ../../node_modules/.pnpm/@prisma+engines@6.17.1/node_modules/@prisma/engines/schema-engine-debian-openssl-3.0.x)
Default Engines Hash    : 272a37d34178c2894197e17273bf937f25acdeac
Studio                  : 0.511.0

$ pnpm --filter @repo/database exec prisma generate --no-hints --schema=./prisma/schema.prisma
Prisma schema loaded from prisma/schema.prisma

✔ Generated Prisma Client (v6.17.1) to ./prisma/generated/client in 156ms

✔ Generated Prisma Zod Generator to ./prisma/zod in 151ms


$ pnpm -w run build:backend

> supastarter-nextjs@0.0.0 build:backend /home/runner/work/supa-screengraph/supa-screengraph
> tsc -b tooling/typescript/tsconfig.backend.json


$ pnpm -w run backend:lint

> supastarter-nextjs@0.0.0 backend:lint /home/runner/work/supa-screengraph/supa-screengraph
> pnpm run lint:arch && pnpm run lint:publint && pnpm run lint:deps


> supastarter-nextjs@0.0.0 lint:arch /home/runner/work/supa-screengraph/supa-screengraph
> node tooling/arch/check-arch.js && node tooling/arch/check-sizes.js && node tooling/arch/check-literals.js

Architecture checks passed.
Size checks passed.
Literal checks passed.

> supastarter-nextjs@0.0.0 lint:publint /home/runner/work/supa-screengraph/supa-screengraph
> npx publint

npm warn exec The following package was not found and will be installed: publint@0.3.14
Running publint v0.3.14 for supastarter-nextjs...
Packing files with `pnpm pack`...
Linting...
Warnings:
1. /tooling/scripts/dev-restart.js is written in ESM, but is interpreted as CJS. Consider using the .mjs extension, e.g. /tooling/scripts/dev-restart.mjs
   Suggestions:
1. The package does not specify the "type" field. Node.js may attempt to detect the package type causing a small performance hit. Consider adding "type": "commonjs".

> supastarter-nextjs@0.0.0 lint:deps /home/runner/work/supa-screengraph/supa-screengraph
> dependency-cruiser --config tooling/arch/dependency-cruiser.cjs .


✔ no dependency violations found (645 modules, 1214 dependencies cruised)


$ pnpm biome ci .
packages/database/prisma/zod/index.js:20:7   FIXABLE  ━━━━━━━━━━━━━━━━

ℹ The computed expression can be simplified without the use of a string literal.

    18 │     Object.defineProperty(o, "default", { enumerable: true, value: v });
    19 │ }) : function(o, v) {
> 20 │     o["default"] = v;
│       ^^^^^^^^^
21 │ });
22 │ var __importStar = (this && this.__importStar) || (function () {

ℹ Unsafe fix: Use a literal key instead.

     18  18 │       Object.defineProperty(o, "default", { enumerable: true, value: v });
     19  19 │   }) : function(o, v) {
     20     │ - ····o["default"]·=·v;
         20 │ + ····o.default·=·v;
     21  21 │   });
     22  22 │   var __importStar = (this && this.__importStar) || (function () {


packages/database/index.js:14:46   FIXABLE  ━━━━━━━━━━━━━━━━━━━━━

⚠ Do not access Object.prototype method 'hasOwnProperty' from target object.

    12 │ }));
    13 │ var __exportStar = (this && this.__exportStar) || function(m, exports) {
> 14 │     for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
│                                              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
15 │ };
16 │ Object.defineProperty(exports, "__esModule", { value: true });

ℹ It's recommended using Object.hasOwn() instead of using Object.hasOwnProperty().

ℹ See  for more details.

ℹ Safe fix: Use 'Object.hasOwn()' instead.

    12 12 │   }));
    13 13 │   var __exportStar = (this && this.__exportStar) || function(m, exports) {
    14    │ - ····for·(var·p·in·m)·if·(p·!==·"default"·&&·!Object.prototype.hasOwnProperty.call(exports,·p))·__createBinding(exports,·m,·p);
       14 │ + ····for·(var·p·in·m)·if·(p·!==·"default"·&&·!Object.hasOwn(exports,·p))·__createBinding(exports,·m,·p);
    15 15 │   };
    16 16 │   Object.defineProperty(exports, "__esModule", { value: true });


packages/database/index.js:1:1   FIXABLE  ━━━━━━━━━━━━━━━━━━━━━━

⚠ Redundant use strict directive.

> 1 │ "use strict";
│ ^^^^^^^^^^^^^
2 │ var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
3 │     if (k2 === undefined) k2 = k;

ℹ The entire contents of JavaScript modules are automatically in strict mode, with no statement needed to initiate it.

ℹ Safe fix: Remove the redundant use strict directive.

    1 │ "use·strict";
      │ -------------

packages/database/index.js:2:75   FIXABLE  ━━━━━━━━━━━━━━━━━━━━━━━━━

⚠ This function expression can be turned into an arrow function.

     1 │ "use strict";
> 2 │ var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
│                                                                           ^^^^^^^^^^^^^^^^^^^^^^^
> 3 │     if (k2 === undefined) k2 = k;
> 4 │     var desc = Object.getOwnPropertyDescriptor(m, k);
...
> 8 │     Object.defineProperty(o, k2, desc);
> 9 │ }) : (function(o, m, k, k2) {
│ ^
10 │     if (k2 === undefined) k2 = k;
11 │     o[k2] = m[k];

ℹ Function expressions that don't use this can be turned into arrow functions.

ℹ Safe fix: Use an arrow function instead.

     1  1 │   "use strict";
     2    │ - var·__createBinding·=·(this·&&·this.__createBinding)·||·(Object.create·?·(function(o,·m,·k,·k2)·{
        2 │ + var·__createBinding·=·(this·&&·this.__createBinding)·||·(Object.create·?·((o,·m,·k,·k2)·=>·{
     3  3 │       if (k2 === undefined) k2 = k;
     4  4 │       var desc = Object.getOwnPropertyDescriptor(m, k);


packages/database/index.js:3:5   FIXABLE  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠ Block statements are preferred in this position.

    1 │ "use strict";
    2 │ var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
> 3 │     if (k2 === undefined) k2 = k;
│     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
4 │     var desc = Object.getOwnPropertyDescriptor(m, k);
5 │     if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {

ℹ Unsafe fix: Wrap the statement with a `JsBlockStatement`

    3 │ ····if·(k2·===·undefined)·{·k2·=·k;·}
      │                           ++       ++

packages/database/index.js:6:39   FIXABLE  ━━━━━━━━━━━━━━━━━━━━━━━━━

⚠ This function expression can be turned into an arrow function.

    4 │     var desc = Object.getOwnPropertyDescriptor(m, k);
    5 │     if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
> 6 │       desc = { enumerable: true, get: function() { return m[k]; } };
│                                       ^^^^^^^^^^^^^^^^^^^^^^^^^^^
7 │     }
8 │     Object.defineProperty(o, k2, desc);

ℹ Function expressions that don't use this can be turned into arrow functions.

ℹ Safe fix: Use an arrow function instead.

     4  4 │       var desc = Object.getOwnPropertyDescriptor(m, k);
     5  5 │       if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
     6    │ - ······desc·=·{·enumerable:·true,·get:·function()·{·return·m[k];·}·};
        6 │ + ······desc·=·{·enumerable:·true,·get:·()·=>·m[k]·};
     7  7 │       }
     8  8 │       Object.defineProperty(o, k2, desc);


packages/database/index.js:9:7   FIXABLE  ━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠ This function expression can be turned into an arrow function.

     7 │     }
     8 │     Object.defineProperty(o, k2, desc);
> 9 │ }) : (function(o, m, k, k2) {
│       ^^^^^^^^^^^^^^^^^^^^^^^
> 10 │     if (k2 === undefined) k2 = k;
> 11 │     o[k2] = m[k];
> 12 │ }));
│ ^
13 │ var __exportStar = (this && this.__exportStar) || function(m, exports) {
14 │     for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);

ℹ Function expressions that don't use this can be turned into arrow functions.

ℹ Safe fix: Use an arrow function instead.

     7  7 │       }
     8  8 │       Object.defineProperty(o, k2, desc);
     9    │ - })·:·(function(o,·m,·k,·k2)·{
        9 │ + })·:·((o,·m,·k,·k2)·=>·{
    10 10 │       if (k2 === undefined) k2 = k;
    11 11 │       o[k2] = m[k];


packages/database/index.js:10:5   FIXABLE  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠ Block statements are preferred in this position.

     8 │     Object.defineProperty(o, k2, desc);
     9 │ }) : (function(o, m, k, k2) {
> 10 │     if (k2 === undefined) k2 = k;
│     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
11 │     o[k2] = m[k];
12 │ }));

ℹ Unsafe fix: Wrap the statement with a `JsBlockStatement`

    10 │ ····if·(k2·===·undefined)·{·k2·=·k;·}
       │                           ++       ++

packages/database/index.js:13:51   FIXABLE  ━━━━━━━━━━━━━━━━━━━━━━━━

⚠ This function expression can be turned into an arrow function.

    11 │     o[k2] = m[k];
    12 │ }));
> 13 │ var __exportStar = (this && this.__exportStar) || function(m, exports) {
│                                                   ^^^^^^^^^^^^^^^^^^^^^^
> 14 │     for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
> 15 │ };
│ ^
16 │ Object.defineProperty(exports, "__esModule", { value: true });
17 │ __exportStar(require("./prisma"), exports);

ℹ Function expressions that don't use this can be turned into arrow functions.

ℹ Safe fix: Use an arrow function instead.

    11 11 │       o[k2] = m[k];
    12 12 │   }));
    13    │ - var·__exportStar·=·(this·&&·this.__exportStar)·||·function(m,·exports)·{
       13 │ + var·__exportStar·=·(this·&&·this.__exportStar)·||·((m,·exports)·=>·{
    14 14 │       for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
    15    │ - };
       15 │ + });
    16 16 │   Object.defineProperty(exports, "__esModule", { value: true });
    17 17 │   __exportStar(require("./prisma"), exports);


packages/database/index.js:14:5   FIXABLE  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠ Block statements are preferred in this position.

    12 │ }));
    13 │ var __exportStar = (this && this.__exportStar) || function(m, exports) {
> 14 │     for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
│     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
15 │ };
16 │ Object.defineProperty(exports, "__esModule", { value: true });

ℹ Unsafe fix: Wrap the statement with a `JsBlockStatement`

    14 │ ····for·(var·p·in·m)·{·if·(p·!==·"default"·&&·!Object.prototype.hasOwnProperty.call(exports,·p))·__createBinding(exports,·m,·p);·}
       │                      ++                                                                                                         ++

packages/database/index.js:14:22   FIXABLE  ━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠ Block statements are preferred in this position.

    12 │ }));
    13 │ var __exportStar = (this && this.__exportStar) || function(m, exports) {
> 14 │     for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
│                      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
15 │ };
16 │ Object.defineProperty(exports, "__esModule", { value: true });

ℹ Unsafe fix: Wrap the statement with a `JsBlockStatement`

    14 │ ····for·(var·p·in·m)·if·(p·!==·"default"·&&·!Object.prototype.hasOwnProperty.call(exports,·p))·{·__createBinding(exports,·m,·p);·}
       │                                                                                                ++                               ++

packages/database/prisma/client.js:1:1   FIXABLE  ━━━━━━━━━━━━━━

⚠ Redundant use strict directive.

> 1 │ "use strict";
│ ^^^^^^^^^^^^^
2 │ Object.defineProperty(exports, "__esModule", { value: true });
3 │ exports.db = void 0;

ℹ The entire contents of JavaScript modules are automatically in strict mode, with no statement needed to initiate it.

ℹ Safe fix: Remove the redundant use strict directive.

    1 │ "use·strict";
      │ -------------

packages/database/prisma/client.js:8:1 suppressions/unused ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠ Suppression comment has no effect. Remove the suppression or make sure you are suppressing the correct rule.

     6 │     return new client_1.PrismaClient();
     7 │ };
> 8 │ // biome-ignore lint/suspicious/noRedeclare: This is a singleton
│ ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
9 │ const prisma = globalThis.prisma ?? prismaClientSingleton();
10 │ exports.db = prisma;


packages/database/prisma/index.js:1:1   FIXABLE  ━━━━━━━━━━━━━━━

⚠ Redundant use strict directive.

> 1 │ "use strict";
│ ^^^^^^^^^^^^^
2 │ var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
3 │     if (k2 === undefined) k2 = k;

ℹ The entire contents of JavaScript modules are automatically in strict mode, with no statement needed to initiate it.

ℹ Safe fix: Remove the redundant use strict directive.

    1 │ "use·strict";
      │ -------------

packages/database/prisma/index.js:2:75   FIXABLE  ━━━━━━━━━━━━━━━━━━

⚠ This function expression can be turned into an arrow function.

     1 │ "use strict";
> 2 │ var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
│                                                                           ^^^^^^^^^^^^^^^^^^^^^^^
> 3 │     if (k2 === undefined) k2 = k;
> 4 │     var desc = Object.getOwnPropertyDescriptor(m, k);
...
> 8 │     Object.defineProperty(o, k2, desc);
> 9 │ }) : (function(o, m, k, k2) {
│ ^
10 │     if (k2 === undefined) k2 = k;
11 │     o[k2] = m[k];

ℹ Function expressions that don't use this can be turned into arrow functions.

ℹ Safe fix: Use an arrow function instead.

     1  1 │   "use strict";
     2    │ - var·__createBinding·=·(this·&&·this.__createBinding)·||·(Object.create·?·(function(o,·m,·k,·k2)·{
        2 │ + var·__createBinding·=·(this·&&·this.__createBinding)·||·(Object.create·?·((o,·m,·k,·k2)·=>·{
     3  3 │       if (k2 === undefined) k2 = k;
     4  4 │       var desc = Object.getOwnPropertyDescriptor(m, k);


packages/database/prisma/index.js:3:5   FIXABLE  ━━━━━━━━━━━━━━━━━━━━━━

⚠ Block statements are preferred in this position.

    1 │ "use strict";
    2 │ var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
> 3 │     if (k2 === undefined) k2 = k;
│     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
4 │     var desc = Object.getOwnPropertyDescriptor(m, k);
5 │     if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {

ℹ Unsafe fix: Wrap the statement with a `JsBlockStatement`

    3 │ ····if·(k2·===·undefined)·{·k2·=·k;·}
      │                           ++       ++

packages/database/prisma/index.js:6:39   FIXABLE  ━━━━━━━━━━━━━━━━━━

⚠ This function expression can be turned into an arrow function.

    4 │     var desc = Object.getOwnPropertyDescriptor(m, k);
    5 │     if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
> 6 │       desc = { enumerable: true, get: function() { return m[k]; } };
│                                       ^^^^^^^^^^^^^^^^^^^^^^^^^^^
7 │     }
8 │     Object.defineProperty(o, k2, desc);

ℹ Function expressions that don't use this can be turned into arrow functions.

ℹ Safe fix: Use an arrow function instead.

     4  4 │       var desc = Object.getOwnPropertyDescriptor(m, k);
     5  5 │       if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
     6    │ - ······desc·=·{·enumerable:·true,·get:·function()·{·return·m[k];·}·};
        6 │ + ······desc·=·{·enumerable:·true,·get:·()·=>·m[k]·};
     7  7 │       }
     8  8 │       Object.defineProperty(o, k2, desc);


packages/database/prisma/index.js:9:7   FIXABLE  ━━━━━━━━━━━━━━━━━━━

⚠ This function expression can be turned into an arrow function.

     7 │     }
     8 │     Object.defineProperty(o, k2, desc);
> 9 │ }) : (function(o, m, k, k2) {
│       ^^^^^^^^^^^^^^^^^^^^^^^
> 10 │     if (k2 === undefined) k2 = k;
> 11 │     o[k2] = m[k];
> 12 │ }));
│ ^
13 │ var __exportStar = (this && this.__exportStar) || function(m, exports) {
14 │     for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);

ℹ Function expressions that don't use this can be turned into arrow functions.

ℹ Safe fix: Use an arrow function instead.

     7  7 │       }
     8  8 │       Object.defineProperty(o, k2, desc);
     9    │ - })·:·(function(o,·m,·k,·k2)·{
        9 │ + })·:·((o,·m,·k,·k2)·=>·{
    10 10 │       if (k2 === undefined) k2 = k;
    11 11 │       o[k2] = m[k];


packages/database/prisma/index.js:10:5   FIXABLE  ━━━━━━━━━━━━━━━━━━━━━

⚠ Block statements are preferred in this position.

     8 │     Object.defineProperty(o, k2, desc);
     9 │ }) : (function(o, m, k, k2) {
> 10 │     if (k2 === undefined) k2 = k;
│     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
11 │     o[k2] = m[k];
12 │ }));

ℹ Unsafe fix: Wrap the statement with a `JsBlockStatement`

    10 │ ····if·(k2·===·undefined)·{·k2·=·k;·}
       │                           ++       ++

packages/database/prisma/index.js:13:51   FIXABLE  ━━━━━━━━━━━━━━━━━

⚠ This function expression can be turned into an arrow function.

    11 │     o[k2] = m[k];
    12 │ }));
> 13 │ var __exportStar = (this && this.__exportStar) || function(m, exports) {
│                                                   ^^^^^^^^^^^^^^^^^^^^^^
> 14 │     for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
> 15 │ };
│ ^
16 │ Object.defineProperty(exports, "__esModule", { value: true });
17 │ __exportStar(require("./client"), exports);

ℹ Function expressions that don't use this can be turned into arrow functions.

ℹ Safe fix: Use an arrow function instead.

    11 11 │       o[k2] = m[k];
    12 12 │   }));
    13    │ - var·__exportStar·=·(this·&&·this.__exportStar)·||·function(m,·exports)·{
       13 │ + var·__exportStar·=·(this·&&·this.__exportStar)·||·((m,·exports)·=>·{
    14 14 │       for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
    15    │ - };
       15 │ + });
    16 16 │   Object.defineProperty(exports, "__esModule", { value: true });
    17 17 │   __exportStar(require("./client"), exports);


packages/database/prisma/index.js:14:5   FIXABLE  ━━━━━━━━━━━━━━━━━━━━━

⚠ Block statements are preferred in this position.

    12 │ }));
    13 │ var __exportStar = (this && this.__exportStar) || function(m, exports) {
> 14 │     for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
│     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
15 │ };
16 │ Object.defineProperty(exports, "__esModule", { value: true });

ℹ Unsafe fix: Wrap the statement with a `JsBlockStatement`

    14 │ ····for·(var·p·in·m)·{·if·(p·!==·"default"·&&·!Object.prototype.hasOwnProperty.call(exports,·p))·__createBinding(exports,·m,·p);·}
       │                      ++                                                                                                         ++

packages/database/prisma/index.js:14:22   FIXABLE  ━━━━━━━━━━━━━━━━━━━━

⚠ Block statements are preferred in this position.

    12 │ }));
    13 │ var __exportStar = (this && this.__exportStar) || function(m, exports) {
> 14 │     for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
│                      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
15 │ };
16 │ Object.defineProperty(exports, "__esModule", { value: true });

ℹ Unsafe fix: Wrap the statement with a `JsBlockStatement`

    14 │ ····for·(var·p·in·m)·if·(p·!==·"default"·&&·!Object.prototype.hasOwnProperty.call(exports,·p))·{·__createBinding(exports,·m,·p);·}
       │                                                                                                ++                               ++

packages/database/prisma/index.js:14:46   FIXABLE  ━━━━━━━━━━━━━━

⚠ Do not access Object.prototype method 'hasOwnProperty' from target object.

    12 │ }));
    13 │ var __exportStar = (this && this.__exportStar) || function(m, exports) {
> 14 │     for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
│                                              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
15 │ };
16 │ Object.defineProperty(exports, "__esModule", { value: true });

ℹ It's recommended using Object.hasOwn() instead of using Object.hasOwnProperty().

ℹ See  for more details.

ℹ Safe fix: Use 'Object.hasOwn()' instead.

    12 12 │   }));
    13 13 │   var __exportStar = (this && this.__exportStar) || function(m, exports) {
    14    │ - ····for·(var·p·in·m)·if·(p·!==·"default"·&&·!Object.prototype.hasOwnProperty.call(exports,·p))·__createBinding(exports,·m,·p);
       14 │ + ····for·(var·p·in·m)·if·(p·!==·"default"·&&·!Object.hasOwn(exports,·p))·__createBinding(exports,·m,·p);
    15 15 │   };
    16 16 │   Object.defineProperty(exports, "__esModule", { value: true });


packages/database/prisma/queries/ai-chats.js:1:1   FIXABLE  ━━━━━━━━━━

⚠ Redundant use strict directive.

> 1 │ "use strict";
│ ^^^^^^^^^^^^^
2 │ Object.defineProperty(exports, "__esModule", { value: true });
3 │ exports.getAiChatsByUserId = getAiChatsByUserId;

ℹ The entire contents of JavaScript modules are automatically in strict mode, with no statement needed to initiate it.

ℹ Safe fix: Remove the redundant use strict directive.

    1 │ "use·strict";
      │ -------------

packages/database/prisma/queries/index.js:3:5   FIXABLE  ━━━━━━━━━━━━━━

⚠ Block statements are preferred in this position.

    1 │ "use strict";
    2 │ var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
> 3 │     if (k2 === undefined) k2 = k;
│     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
4 │     var desc = Object.getOwnPropertyDescriptor(m, k);
5 │     if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {

ℹ Unsafe fix: Wrap the statement with a `JsBlockStatement`

    3 │ ····if·(k2·===·undefined)·{·k2·=·k;·}
      │                           ++       ++

packages/database/prisma/queries/index.js:14:46   FIXABLE  ━━━━━━━━━━

⚠ Do not access Object.prototype method 'hasOwnProperty' from target object.

    12 │ }));
    13 │ var __exportStar = (this && this.__exportStar) || function(m, exports) {
> 14 │     for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
│                                              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
15 │ };
16 │ Object.defineProperty(exports, "__esModule", { value: true });

ℹ It's recommended using Object.hasOwn() instead of using Object.hasOwnProperty().

ℹ See  for more details.

ℹ Safe fix: Use 'Object.hasOwn()' instead.

    12 12 │   }));
    13 13 │   var __exportStar = (this && this.__exportStar) || function(m, exports) {
    14    │ - ····for·(var·p·in·m)·if·(p·!==·"default"·&&·!Object.prototype.hasOwnProperty.call(exports,·p))·__createBinding(exports,·m,·p);
       14 │ + ····for·(var·p·in·m)·if·(p·!==·"default"·&&·!Object.hasOwn(exports,·p))·__createBinding(exports,·m,·p);
    15 15 │   };
    16 16 │   Object.defineProperty(exports, "__esModule", { value: true });


packages/database/prisma/queries/index.js:1:1   FIXABLE  ━━━━━━━━━━

⚠ Redundant use strict directive.

> 1 │ "use strict";
│ ^^^^^^^^^^^^^
2 │ var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
3 │     if (k2 === undefined) k2 = k;

ℹ The entire contents of JavaScript modules are automatically in strict mode, with no statement needed to initiate it.

ℹ Safe fix: Remove the redundant use strict directive.

    1 │ "use·strict";
      │ -------------

packages/database/prisma/queries/index.js:2:75   FIXABLE  ━━━━━━━━━━

⚠ This function expression can be turned into an arrow function.

     1 │ "use strict";
> 2 │ var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
│                                                                           ^^^^^^^^^^^^^^^^^^^^^^^
> 3 │     if (k2 === undefined) k2 = k;
> 4 │     var desc = Object.getOwnPropertyDescriptor(m, k);
...
> 8 │     Object.defineProperty(o, k2, desc);
> 9 │ }) : (function(o, m, k, k2) {
│ ^
10 │     if (k2 === undefined) k2 = k;
11 │     o[k2] = m[k];

ℹ Function expressions that don't use this can be turned into arrow functions.

ℹ Safe fix: Use an arrow function instead.

     1  1 │   "use strict";
     2    │ - var·__createBinding·=·(this·&&·this.__createBinding)·||·(Object.create·?·(function(o,·m,·k,·k2)·{
        2 │ + var·__createBinding·=·(this·&&·this.__createBinding)·||·(Object.create·?·((o,·m,·k,·k2)·=>·{
     3  3 │       if (k2 === undefined) k2 = k;
     4  4 │       var desc = Object.getOwnPropertyDescriptor(m, k);


packages/database/prisma/queries/index.js:6:39   FIXABLE  ━━━━━━━━━━

⚠ This function expression can be turned into an arrow function.

    4 │     var desc = Object.getOwnPropertyDescriptor(m, k);
    5 │     if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
> 6 │       desc = { enumerable: true, get: function() { return m[k]; } };
│                                       ^^^^^^^^^^^^^^^^^^^^^^^^^^^
7 │     }
8 │     Object.defineProperty(o, k2, desc);

ℹ Function expressions that don't use this can be turned into arrow functions.

ℹ Safe fix: Use an arrow function instead.

     4  4 │       var desc = Object.getOwnPropertyDescriptor(m, k);
     5  5 │       if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
     6    │ - ······desc·=·{·enumerable:·true,·get:·function()·{·return·m[k];·}·};
        6 │ + ······desc·=·{·enumerable:·true,·get:·()·=>·m[k]·};
     7  7 │       }
     8  8 │       Object.defineProperty(o, k2, desc);


packages/database/prisma/queries/index.js:9:7   FIXABLE  ━━━━━━━━━━━

⚠ This function expression can be turned into an arrow function.

     7 │     }
     8 │     Object.defineProperty(o, k2, desc);
> 9 │ }) : (function(o, m, k, k2) {
│       ^^^^^^^^^^^^^^^^^^^^^^^
> 10 │     if (k2 === undefined) k2 = k;
> 11 │     o[k2] = m[k];
> 12 │ }));
│ ^
13 │ var __exportStar = (this && this.__exportStar) || function(m, exports) {
14 │     for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);

ℹ Function expressions that don't use this can be turned into arrow functions.

ℹ Safe fix: Use an arrow function instead.

     7  7 │       }
     8  8 │       Object.defineProperty(o, k2, desc);
     9    │ - })·:·(function(o,·m,·k,·k2)·{
        9 │ + })·:·((o,·m,·k,·k2)·=>·{
    10 10 │       if (k2 === undefined) k2 = k;
    11 11 │       o[k2] = m[k];


packages/database/prisma/queries/index.js:10:5   FIXABLE  ━━━━━━━━━━━━━

⚠ Block statements are preferred in this position.

     8 │     Object.defineProperty(o, k2, desc);
     9 │ }) : (function(o, m, k, k2) {
> 10 │     if (k2 === undefined) k2 = k;
│     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
11 │     o[k2] = m[k];
12 │ }));

ℹ Unsafe fix: Wrap the statement with a `JsBlockStatement`

    10 │ ····if·(k2·===·undefined)·{·k2·=·k;·}
       │                           ++       ++

packages/database/prisma/queries/index.js:13:51   FIXABLE  ━━━━━━━━━━

⚠ This function expression can be turned into an arrow function.

    11 │     o[k2] = m[k];
    12 │ }));
> 13 │ var __exportStar = (this && this.__exportStar) || function(m, exports) {
│                                                   ^^^^^^^^^^^^^^^^^^^^^^
> 14 │     for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
> 15 │ };
│ ^
16 │ Object.defineProperty(exports, "__esModule", { value: true });
17 │ __exportStar(require("./ai-chats"), exports);

ℹ Function expressions that don't use this can be turned into arrow functions.

ℹ Safe fix: Use an arrow function instead.

    11 11 │       o[k2] = m[k];
    12 12 │   }));
    13    │ - var·__exportStar·=·(this·&&·this.__exportStar)·||·function(m,·exports)·{
       13 │ + var·__exportStar·=·(this·&&·this.__exportStar)·||·((m,·exports)·=>·{
    14 14 │       for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
    15    │ - };
       15 │ + });
    16 16 │   Object.defineProperty(exports, "__esModule", { value: true });
    17 17 │   __exportStar(require("./ai-chats"), exports);


packages/database/prisma/queries/index.js:14:5   FIXABLE  ━━━━━━━━━━━━━

⚠ Block statements are preferred in this position.

    12 │ }));
    13 │ var __exportStar = (this && this.__exportStar) || function(m, exports) {
> 14 │     for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
│     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
15 │ };
16 │ Object.defineProperty(exports, "__esModule", { value: true });

ℹ Unsafe fix: Wrap the statement with a `JsBlockStatement`

    14 │ ····for·(var·p·in·m)·{·if·(p·!==·"default"·&&·!Object.prototype.hasOwnProperty.call(exports,·p))·__createBinding(exports,·m,·p);·}
       │                      ++                                                                                                         ++

packages/database/prisma/queries/index.js:14:22   FIXABLE  ━━━━━━━━━━━━

⚠ Block statements are preferred in this position.

    12 │ }));
    13 │ var __exportStar = (this && this.__exportStar) || function(m, exports) {
> 14 │     for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
│                      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
15 │ };
16 │ Object.defineProperty(exports, "__esModule", { value: true });

ℹ Unsafe fix: Wrap the statement with a `JsBlockStatement`

    14 │ ····for·(var·p·in·m)·if·(p·!==·"default"·&&·!Object.prototype.hasOwnProperty.call(exports,·p))·{·__createBinding(exports,·m,·p);·}
       │                                                                                                ++                               ++

packages/database/prisma/queries/organizations.js:1:1   FIXABLE  ━━━━━━━━━━

⚠ Redundant use strict directive.

> 1 │ "use strict";
│ ^^^^^^^^^^^^^
2 │ Object.defineProperty(exports, "__esModule", { value: true });
3 │ exports.getOrganizations = getOrganizations;

ℹ The entire contents of JavaScript modules are automatically in strict mode, with no statement needed to initiate it.

ℹ Safe fix: Remove the redundant use strict directive.

    1 │ "use·strict";
      │ -------------

packages/database/prisma/queries/purchases.js:1:1   FIXABLE  ━━━━━━━━━━

⚠ Redundant use strict directive.

> 1 │ "use strict";
│ ^^^^^^^^^^^^^
2 │ Object.defineProperty(exports, "__esModule", { value: true });
3 │ exports.getPurchaseById = getPurchaseById;

ℹ The entire contents of JavaScript modules are automatically in strict mode, with no statement needed to initiate it.

ℹ Safe fix: Remove the redundant use strict directive.

    1 │ "use·strict";
      │ -------------

packages/database/prisma/queries/users.js:1:1   FIXABLE  ━━━━━━━━━━

⚠ Redundant use strict directive.

> 1 │ "use strict";
│ ^^^^^^^^^^^^^
2 │ Object.defineProperty(exports, "__esModule", { value: true });
3 │ exports.getUsers = getUsers;

ℹ The entire contents of JavaScript modules are automatically in strict mode, with no statement needed to initiate it.

ℹ Safe fix: Remove the redundant use strict directive.

    1 │ "use·strict";
      │ -------------

packages/database/prisma/zod/index.js:17:81   FIXABLE  ━━━━━━━━━━━━━

⚠ This function expression can be turned into an arrow function.

    15 │     o[k2] = m[k];
    16 │ }));
> 17 │ var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
│                                                                                 ^^^^^^^^^^^^^^^^
> 18 │     Object.defineProperty(o, "default", { enumerable: true, value: v });
> 19 │ }) : function(o, v) {
│ ^
20 │     o["default"] = v;
21 │ });

ℹ Function expressions that don't use this can be turned into arrow functions.

ℹ Safe fix: Use an arrow function instead.

     15  15 │       o[k2] = m[k];
     16  16 │   }));
     17     │ - var·__setModuleDefault·=·(this·&&·this.__setModuleDefault)·||·(Object.create·?·(function(o,·v)·{
         17 │ + var·__setModuleDefault·=·(this·&&·this.__setModuleDefault)·||·(Object.create·?·((o,·v)·=>·{
     18  18 │       Object.defineProperty(o, "default", { enumerable: true, value: v });
     19  19 │   }) : function(o, v) {


packages/database/prisma/zod/index.js:32:13   FIXABLE  ━━━━━━━━━━━━━

⚠ Change to an optional chain.

    30 │     };
    31 │     return function (mod) {
> 32 │         if (mod && mod.__esModule) return mod;
│             ^^^^^^^^^^^^^^^^^^^^^
33 │         var result = {};
34 │         if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);

ℹ Unsafe fix: Change to an optional chain.

     30  30 │       };
     31  31 │       return function (mod) {
     32     │ - ········if·(mod·&&·mod.__esModule)·return·mod;
         32 │ + ········if·(mod?.__esModule)·return·mod;
     33  33 │           var result = {};
     34  34 │           if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);


packages/database/prisma/zod/index.js:1:1   FIXABLE  ━━━━━━━━━━━

⚠ Redundant use strict directive.

> 1 │ "use strict";
│ ^^^^^^^^^^^^^
2 │ /**
3 │  * Prisma Zod Generator - Single File (inlined)

ℹ The entire contents of JavaScript modules are automatically in strict mode, with no statement needed to initiate it.

ℹ Safe fix: Remove the redundant use strict directive.

    1 │ "use·strict";
      │ -------------

packages/database/prisma/zod/index.js:10:39   FIXABLE  ━━━━━━━━━━━━━

⚠ This function expression can be turned into an arrow function.

     8 │     var desc = Object.getOwnPropertyDescriptor(m, k);
     9 │     if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
> 10 │       desc = { enumerable: true, get: function() { return m[k]; } };
│                                       ^^^^^^^^^^^^^^^^^^^^^^^^^^^
11 │     }
12 │     Object.defineProperty(o, k2, desc);

ℹ Function expressions that don't use this can be turned into arrow functions.

ℹ Safe fix: Use an arrow function instead.

      8   8 │       var desc = Object.getOwnPropertyDescriptor(m, k);
      9   9 │       if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
     10     │ - ······desc·=·{·enumerable:·true,·get:·function()·{·return·m[k];·}·};
         10 │ + ······desc·=·{·enumerable:·true,·get:·()·=>·m[k]·};
     11  11 │       }
     12  12 │       Object.defineProperty(o, k2, desc);


packages/database/prisma/zod/index.js:13:7   FIXABLE  ━━━━━━━━━━━━━━

⚠ This function expression can be turned into an arrow function.

    11 │     }
    12 │     Object.defineProperty(o, k2, desc);
> 13 │ }) : (function(o, m, k, k2) {
│       ^^^^^^^^^^^^^^^^^^^^^^^
> 14 │     if (k2 === undefined) k2 = k;
> 15 │     o[k2] = m[k];
> 16 │ }));
│ ^
17 │ var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
18 │     Object.defineProperty(o, "default", { enumerable: true, value: v });

ℹ Function expressions that don't use this can be turned into arrow functions.

ℹ Safe fix: Use an arrow function instead.

     11  11 │       }
     12  12 │       Object.defineProperty(o, k2, desc);
     13     │ - })·:·(function(o,·m,·k,·k2)·{
         13 │ + })·:·((o,·m,·k,·k2)·=>·{
     14  14 │       if (k2 === undefined) k2 = k;
     15  15 │       o[k2] = m[k];


packages/database/prisma/zod/index.js:14:5   FIXABLE  ━━━━━━━━━━━━━━━━━

⚠ Block statements are preferred in this position.

    12 │     Object.defineProperty(o, k2, desc);
    13 │ }) : (function(o, m, k, k2) {
> 14 │     if (k2 === undefined) k2 = k;
│     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
15 │     o[k2] = m[k];
16 │ }));

ℹ Unsafe fix: Wrap the statement with a `JsBlockStatement`

    14 │ ····if·(k2·===·undefined)·{·k2·=·k;·}
       │                           ++       ++

packages/database/prisma/zod/index.js:6:75   FIXABLE  ━━━━━━━━━━━━━━

⚠ This function expression can be turned into an arrow function.

     4 │  * Auto-generated. Do not edit.
     5 │  */
> 6 │ var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
│                                                                           ^^^^^^^^^^^^^^^^^^^^^^^
> 7 │     if (k2 === undefined) k2 = k;
...
> 12 │     Object.defineProperty(o, k2, desc);
> 13 │ }) : (function(o, m, k, k2) {
│ ^
14 │     if (k2 === undefined) k2 = k;
15 │     o[k2] = m[k];

ℹ Function expressions that don't use this can be turned into arrow functions.

ℹ Safe fix: Use an arrow function instead.

      4   4 │    * Auto-generated. Do not edit.
      5   5 │    */
      6     │ - var·__createBinding·=·(this·&&·this.__createBinding)·||·(Object.create·?·(function(o,·m,·k,·k2)·{
          6 │ + var·__createBinding·=·(this·&&·this.__createBinding)·||·(Object.create·?·((o,·m,·k,·k2)·=>·{
      7   7 │       if (k2 === undefined) k2 = k;
      8   8 │       var desc = Object.getOwnPropertyDescriptor(m, k);


packages/database/prisma/zod/index.js:19:6   FIXABLE  ━━━━━━━━━━━━━━

⚠ This function expression can be turned into an arrow function.

    17 │ var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    18 │     Object.defineProperty(o, "default", { enumerable: true, value: v });
> 19 │ }) : function(o, v) {
│      ^^^^^^^^^^^^^^^^
> 20 │     o["default"] = v;
> 21 │ });
│ ^
22 │ var __importStar = (this && this.__importStar) || (function () {
23 │     var ownKeys = function(o) {

ℹ Function expressions that don't use this can be turned into arrow functions.

ℹ Safe fix: Use an arrow function instead.

     17  17 │   var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
     18  18 │       Object.defineProperty(o, "default", { enumerable: true, value: v });
     19     │ - })·:·function(o,·v)·{
         19 │ + })·:·((o,·v)·=>·{
     20  20 │       o["default"] = v;
     21     │ - });
         21 │ + }));
     22  22 │   var __importStar = (this && this.__importStar) || (function () {
     23  23 │       var ownKeys = function(o) {


packages/database/prisma/zod/index.js:7:5   FIXABLE  ━━━━━━━━━━━━━━━━━━

⚠ Block statements are preferred in this position.

    5 │  */
    6 │ var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
> 7 │     if (k2 === undefined) k2 = k;
│     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
8 │     var desc = Object.getOwnPropertyDescriptor(m, k);
9 │     if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {

ℹ Unsafe fix: Wrap the statement with a `JsBlockStatement`

    7 │ ····if·(k2·===·undefined)·{·k2·=·k;·}
      │                           ++       ++

packages/database/prisma/zod/index.js:22:52   FIXABLE  ━━━━━━━━━━━━━

⚠ This function expression can be turned into an arrow function.

    20 │     o["default"] = v;
    21 │ });
> 22 │ var __importStar = (this && this.__importStar) || (function () {
│                                                    ^^^^^^^^^^^^^
> 23 │     var ownKeys = function(o) {
...
> 37 │     };
> 38 │ })();
│ ^
39 │ Object.defineProperty(exports, "__esModule", { value: true });
40 │ exports.AiChatSchema = exports.PurchaseSchema = exports.InvitationSchema = exports.MemberSchema = exports.OrganizationSchema = exports.TwoFactorSchema = exports.PasskeySchema = exports.VerificationSchema = exports.AccountSchema = exports.SessionSchema = exports.UserSchema = exports.PurchaseTypeSchema = exports.JsonNullValueFilterSchema = exports.NullsOrderSchema = exports.QueryModeSchema = exports.JsonNullValueInputSchema = exports.SortOrderSchema = exports.AiChatScalarFieldEnumSchema = exports.PurchaseScalarFieldEnumSchema = exports.InvitationScalarFieldEnumSchema = exports.MemberScalarFieldEnumSchema = exports.OrganizationScalarFieldEnumSchema = exports.TwoFactorScalarFieldEnumSchema = exports.PasskeyScalarFieldEnumSchema = exports.VerificationScalarFieldEnumSchema = exports.AccountScalarFieldEnumSchema = exports.SessionScalarFieldEnumSchema = exports.UserScalarFieldEnumSchema = exports.TransactionIsolationLevelSchema = void 0;

ℹ Function expressions that don't use this can be turned into arrow functions.

ℹ Safe fix: Use an arrow function instead.

     20  20 │       o["default"] = v;
     21  21 │   });
     22     │ - var·__importStar·=·(this·&&·this.__importStar)·||·(function·()·{
         22 │ + var·__importStar·=·(this·&&·this.__importStar)·||·(()·=>·{
     23  23 │       var ownKeys = function(o) {
     24  24 │           ownKeys = Object.getOwnPropertyNames || function (o) {


packages/database/prisma/zod/index.js:23:19   FIXABLE  ━━━━━━━━━━━━━

⚠ This function expression can be turned into an arrow function.

    21 │ });
    22 │ var __importStar = (this && this.__importStar) || (function () {
> 23 │     var ownKeys = function(o) {
│                   ^^^^^^^^^^^^^
> 24 │         ownKeys = Object.getOwnPropertyNames || function (o) {
...
> 29 │         return ownKeys(o);
> 30 │     };
│     ^
31 │     return function (mod) {
32 │         if (mod && mod.__esModule) return mod;

ℹ Function expressions that don't use this can be turned into arrow functions.

ℹ Safe fix: Use an arrow function instead.

     21  21 │   });
     22  22 │   var __importStar = (this && this.__importStar) || (function () {
     23     │ - ····var·ownKeys·=·function(o)·{
         23 │ + ····var·ownKeys·=·(o)·=>·{
     24  24 │           ownKeys = Object.getOwnPropertyNames || function (o) {
     25  25 │               var ar = [];


packages/database/prisma/zod/index.js:24:49   FIXABLE  ━━━━━━━━━━━━━

⚠ This function expression can be turned into an arrow function.

    22 │ var __importStar = (this && this.__importStar) || (function () {
    23 │     var ownKeys = function(o) {
> 24 │         ownKeys = Object.getOwnPropertyNames || function (o) {
│                                                 ^^^^^^^^^^^^^^
> 25 │             var ar = [];
> 26 │             for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
> 27 │             return ar;
> 28 │         };
│         ^
29 │         return ownKeys(o);
30 │     };

ℹ Function expressions that don't use this can be turned into arrow functions.

ℹ Safe fix: Use an arrow function instead.

     22  22 │   var __importStar = (this && this.__importStar) || (function () {
     23  23 │       var ownKeys = function(o) {
     24     │ - ········ownKeys·=·Object.getOwnPropertyNames·||·function·(o)·{
         24 │ + ········ownKeys·=·Object.getOwnPropertyNames·||·((o)·=>·{
     25  25 │               var ar = [];
     26  26 │               for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
     27  27 │               return ar;
     28     │ - ········};
         28 │ + ········});
     29  29 │           return ownKeys(o);
     30  30 │       };


packages/database/prisma/zod/index.js:26:13   FIXABLE  ━━━━━━━━━━━━━━━━

⚠ Block statements are preferred in this position.

    24 │         ownKeys = Object.getOwnPropertyNames || function (o) {
    25 │             var ar = [];
> 26 │             for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
│             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
27 │             return ar;
28 │         };

ℹ Unsafe fix: Wrap the statement with a `JsBlockStatement`

    26 │ ············for·(var·k·in·o)·{·if·(Object.prototype.hasOwnProperty.call(o,·k))·ar[ar.length]·=·k;·}
       │                              ++                                                                  ++

packages/database/prisma/zod/index.js:26:30   FIXABLE  ━━━━━━━━━━━━━━━━

⚠ Block statements are preferred in this position.

    24 │         ownKeys = Object.getOwnPropertyNames || function (o) {
    25 │             var ar = [];
> 26 │             for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
│                              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
27 │             return ar;
28 │         };

ℹ Unsafe fix: Wrap the statement with a `JsBlockStatement`

    26 │ ············for·(var·k·in·o)·if·(Object.prototype.hasOwnProperty.call(o,·k))·{·ar[ar.length]·=·k;·}
       │                                                                              ++                  ++

packages/database/prisma/zod/index.js:31:12   FIXABLE  ━━━━━━━━━━━━━

⚠ This function expression can be turned into an arrow function.

    29 │         return ownKeys(o);
    30 │     };
> 31 │     return function (mod) {
│            ^^^^^^^^^^^^^^^^
> 32 │         if (mod && mod.__esModule) return mod;
...
> 36 │         return result;
> 37 │     };
│     ^
38 │ })();
39 │ Object.defineProperty(exports, "__esModule", { value: true });

ℹ Function expressions that don't use this can be turned into arrow functions.

ℹ Safe fix: Use an arrow function instead.

     29  29 │           return ownKeys(o);
     30  30 │       };
     31     │ - ····return·function·(mod)·{
         31 │ + ····return·(mod)·=>·{
     32  32 │           if (mod && mod.__esModule) return mod;
     33  33 │           var result = {};


packages/database/prisma/zod/index.js:32:9   FIXABLE  ━━━━━━━━━━━━━━━━━

⚠ Block statements are preferred in this position.

    30 │     };
    31 │     return function (mod) {
> 32 │         if (mod && mod.__esModule) return mod;
│         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
33 │         var result = {};
34 │         if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);

ℹ Unsafe fix: Wrap the statement with a `JsBlockStatement`

    32 │ ········if·(mod·&&·mod.__esModule)·{·return·mod;·}
       │                                    ++           ++

packages/database/prisma/zod/index.js:34:9   FIXABLE  ━━━━━━━━━━━━━━━━━

⚠ Block statements are preferred in this position.

    32 │         if (mod && mod.__esModule) return mod;
    33 │         var result = {};
> 34 │         if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
│         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
35 │         __setModuleDefault(result, mod);
36 │         return result;

ℹ Unsafe fix: Wrap the statement with a `JsBlockStatement`

    34 │ ········if·(mod·!=·null)·{·for·(var·k·=·ownKeys(mod),·i·=·0;·i·<·k.length;·i++)·if·(k[i]·!==·"default")·__createBinding(result,·mod,·k[i]);·}
       │                          ++                                                                                                                ++

packages/database/prisma/zod/index.js:34:26   FIXABLE  ━━━━━━━━━━━━━━━━

⚠ Block statements are preferred in this position.

    32 │         if (mod && mod.__esModule) return mod;
    33 │         var result = {};
> 34 │         if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
│                          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
35 │         __setModuleDefault(result, mod);
36 │         return result;

ℹ Unsafe fix: Wrap the statement with a `JsBlockStatement`

    34 │ ········if·(mod·!=·null)·for·(var·k·=·ownKeys(mod),·i·=·0;·i·<·k.length;·i++)·{·if·(k[i]·!==·"default")·__createBinding(result,·mod,·k[i]);·}
       │                                                                               ++                                                           ++

packages/database/prisma/zod/index.js:34:79   FIXABLE  ━━━━━━━━━━━━━━━━

⚠ Block statements are preferred in this position.

    32 │         if (mod && mod.__esModule) return mod;
    33 │         var result = {};
> 34 │         if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
│                                                                               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
35 │         __setModuleDefault(result, mod);
36 │         return result;

ℹ Unsafe fix: Wrap the statement with a `JsBlockStatement`

    34 │ ········if·(mod·!=·null)·for·(var·k·=·ownKeys(mod),·i·=·0;·i·<·k.length;·i++)·if·(k[i]·!==·"default")·{·__createBinding(result,·mod,·k[i]);·}
       │                                                                                                       ++                                   ++

packages/database/prisma/zod/index.js:203:84   FIXABLE  ━━━━━━━━━━━━━━━

⚠ Block statements are preferred in this position.

    201 │     userId: z.string().nullish(),
    202 │     title: z.string().nullish(),
> 203 │     messages: z.unknown().refine((val) => { const getDepth = (obj, depth = 0) => { if (depth > 10)
│                                                                                    ^^^^^^^^^^^^^^^
> 204 │         return depth; if (obj === null || typeof obj !== 'object')
│         ^^^^^^^^^^^^^
205 │         return depth; const values = Object.values(obj); if (values.length === 0)
206 │         return depth; return Math.max(...values.map(v => getDepth(v, depth + 1))); }; return getDepth(val) <= 10; }, "JSON nesting depth exceeds maximum of 10").default("[]"),

ℹ Unsafe fix: Wrap the statement with a `JsBlockStatement`

    201 201 │       userId: z.string().nullish(),
    202 202 │       title: z.string().nullish(),
    203     │ - ····messages:·z.unknown().refine((val)·=>·{·const·getDepth·=·(obj,·depth·=·0)·=>·{·if·(depth·>·10)
    204     │ - ········return·depth;·if·(obj·===·null·||·typeof·obj·!==·'object')
        203 │ + ····messages:·z.unknown().refine((val)·=>·{·const·getDepth·=·(obj,·depth·=·0)·=>·{·if·(depth·>·10)·{
        204 │ + ········return·depth;··}if·(obj·===·null·||·typeof·obj·!==·'object')
    205 205 │           return depth; const values = Object.values(obj); if (values.length === 0)
    206 206 │           return depth; return Math.max(...values.map(v => getDepth(v, depth + 1))); }; return getDepth(val) <= 10; }, "JSON nesting depth exceeds maximum of 10").default("[]"),


packages/database/prisma/zod/index.js:204:23   FIXABLE  ━━━━━━━━━━━━━━━

⚠ Block statements are preferred in this position.

    202 │     title: z.string().nullish(),
    203 │     messages: z.unknown().refine((val) => { const getDepth = (obj, depth = 0) => { if (depth > 10)
> 204 │         return depth; if (obj === null || typeof obj !== 'object')
│                       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
> 205 │         return depth; const values = Object.values(obj); if (values.length === 0)
│         ^^^^^^^^^^^^^
206 │         return depth; return Math.max(...values.map(v => getDepth(v, depth + 1))); }; return getDepth(val) <= 10; }, "JSON nesting depth exceeds maximum of 10").default("[]"),
207 │     createdAt: z.date(),

ℹ Unsafe fix: Wrap the statement with a `JsBlockStatement`

    202 202 │       title: z.string().nullish(),
    203 203 │       messages: z.unknown().refine((val) => { const getDepth = (obj, depth = 0) => { if (depth > 10)
    204     │ - ········return·depth;·if·(obj·===·null·||·typeof·obj·!==·'object')
    205     │ - ········return·depth;·const·values·=·Object.values(obj);·if·(values.length·===·0)
        204 │ + ········return·depth;·if·(obj·===·null·||·typeof·obj·!==·'object')·{
        205 │ + ········return·depth;··}const·values·=·Object.values(obj);·if·(values.length·===·0)
    206 206 │           return depth; return Math.max(...values.map(v => getDepth(v, depth + 1))); }; return getDepth(val) <= 10; }, "JSON nesting depth exceeds maximum of 10").default("[]"),
    207 207 │       createdAt: z.date(),


packages/database/prisma/zod/index.js:205:58   FIXABLE  ━━━━━━━━━━━━━━━

⚠ Block statements are preferred in this position.

    203 │     messages: z.unknown().refine((val) => { const getDepth = (obj, depth = 0) => { if (depth > 10)
    204 │         return depth; if (obj === null || typeof obj !== 'object')
> 205 │         return depth; const values = Object.values(obj); if (values.length === 0)
│                                                          ^^^^^^^^^^^^^^^^^^^^^^^^
> 206 │         return depth; return Math.max(...values.map(v => getDepth(v, depth + 1))); }; return getDepth(val) <= 10; }, "JSON nesting depth exceeds maximum of 10").default("[]"),
│         ^^^^^^^^^^^^^
207 │     createdAt: z.date(),
208 │     updatedAt: z.date(),

ℹ Unsafe fix: Wrap the statement with a `JsBlockStatement`

    203 203 │       messages: z.unknown().refine((val) => { const getDepth = (obj, depth = 0) => { if (depth > 10)
    204 204 │           return depth; if (obj === null || typeof obj !== 'object')
    205     │ - ········return·depth;·const·values·=·Object.values(obj);·if·(values.length·===·0)
    206     │ - ········return·depth;·return·Math.max(...values.map(v·=>·getDepth(v,·depth·+·1)));·};·return·getDepth(val)·<=·10;·},·"JSON·nesting·depth·exceeds·maximum·of·10").default("[]"),
        205 │ + ········return·depth;·const·values·=·Object.values(obj);·if·(values.length·===·0)·{
        206 │ + ········return·depth;··}return·Math.max(...values.map(v·=>·getDepth(v,·depth·+·1)));·};·return·getDepth(val)·<=·10;·},·"JSON·nesting·depth·exceeds·maximum·of·10").default("[]"),
    207 207 │       createdAt: z.date(),
    208 208 │       updatedAt: z.date(),


packages/database/prisma/zod/index.js:26:34   FIXABLE  ━━━━━━━━━━

⚠ Do not access Object.prototype method 'hasOwnProperty' from target object.

    24 │         ownKeys = Object.getOwnPropertyNames || function (o) {
    25 │             var ar = [];
> 26 │             for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
│                                  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
27 │             return ar;
28 │         };

ℹ It's recommended using Object.hasOwn() instead of using Object.hasOwnProperty().

ℹ See  for more details.

ℹ Safe fix: Use 'Object.hasOwn()' instead.

     24  24 │           ownKeys = Object.getOwnPropertyNames || function (o) {
     25  25 │               var ar = [];
     26     │ - ············for·(var·k·in·o)·if·(Object.prototype.hasOwnProperty.call(o,·k))·ar[ar.length]·=·k;
         26 │ + ············for·(var·k·in·o)·if·(Object.hasOwn(o,·k))·ar[ar.length]·=·k;
     27  27 │               return ar;
     28  28 │           };


packages/database/index.js:3:27  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✖ Assigning a function parameter is confusing.

    1 │ "use strict";
    2 │ var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
> 3 │     if (k2 === undefined) k2 = k;
│                           ^^
4 │     var desc = Object.getOwnPropertyDescriptor(m, k);
5 │     if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {

ℹ The parameter is declared here:

    1 │ "use strict";
> 2 │ var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
│                                                                                             ^^
3 │     if (k2 === undefined) k2 = k;
4 │     var desc = Object.getOwnPropertyDescriptor(m, k);

ℹ Developers usually expect function parameters to be readonly. To align with this expectation, use a local variable instead.


packages/database/index.js:10:27  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✖ Assigning a function parameter is confusing.

     8 │     Object.defineProperty(o, k2, desc);
     9 │ }) : (function(o, m, k, k2) {
> 10 │     if (k2 === undefined) k2 = k;
│                           ^^
11 │     o[k2] = m[k];
12 │ }));

ℹ The parameter is declared here:

     7 │     }
     8 │     Object.defineProperty(o, k2, desc);
> 9 │ }) : (function(o, m, k, k2) {
│                         ^^
10 │     if (k2 === undefined) k2 = k;
11 │     o[k2] = m[k];

ℹ Developers usually expect function parameters to be readonly. To align with this expectation, use a local variable instead.


packages/database/prisma/index.js:3:27  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✖ Assigning a function parameter is confusing.

    1 │ "use strict";
    2 │ var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
> 3 │     if (k2 === undefined) k2 = k;
│                           ^^
4 │     var desc = Object.getOwnPropertyDescriptor(m, k);
5 │     if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {

ℹ The parameter is declared here:

    1 │ "use strict";
> 2 │ var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
│                                                                                             ^^
3 │     if (k2 === undefined) k2 = k;
4 │     var desc = Object.getOwnPropertyDescriptor(m, k);

ℹ Developers usually expect function parameters to be readonly. To align with this expectation, use a local variable instead.


packages/database/prisma/index.js:10:27  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✖ Assigning a function parameter is confusing.

     8 │     Object.defineProperty(o, k2, desc);
     9 │ }) : (function(o, m, k, k2) {
> 10 │     if (k2 === undefined) k2 = k;
│                           ^^
11 │     o[k2] = m[k];
12 │ }));

ℹ The parameter is declared here:

     7 │     }
     8 │     Object.defineProperty(o, k2, desc);
> 9 │ }) : (function(o, m, k, k2) {
│                         ^^
10 │     if (k2 === undefined) k2 = k;
11 │     o[k2] = m[k];

ℹ Developers usually expect function parameters to be readonly. To align with this expectation, use a local variable instead.


packages/database/prisma/queries/index.js:3:27  ━━━━━━━━━━━━━━━━━━━━━━━━

✖ Assigning a function parameter is confusing.

    1 │ "use strict";
    2 │ var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
> 3 │     if (k2 === undefined) k2 = k;
│                           ^^
4 │     var desc = Object.getOwnPropertyDescriptor(m, k);
5 │     if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {

ℹ The parameter is declared here:

    1 │ "use strict";
> 2 │ var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
│                                                                                             ^^
3 │     if (k2 === undefined) k2 = k;
4 │     var desc = Object.getOwnPropertyDescriptor(m, k);

ℹ Developers usually expect function parameters to be readonly. To align with this expectation, use a local variable instead.


packages/database/prisma/queries/index.js:10:27  ━━━━━━━━━━━━━━━━━━━━━━━

✖ Assigning a function parameter is confusing.

     8 │     Object.defineProperty(o, k2, desc);
     9 │ }) : (function(o, m, k, k2) {
> 10 │     if (k2 === undefined) k2 = k;
│                           ^^
11 │     o[k2] = m[k];
12 │ }));

ℹ The parameter is declared here:

     7 │     }
     8 │     Object.defineProperty(o, k2, desc);
> 9 │ }) : (function(o, m, k, k2) {
│                         ^^
10 │     if (k2 === undefined) k2 = k;
11 │     o[k2] = m[k];

ℹ Developers usually expect function parameters to be readonly. To align with this expectation, use a local variable instead.


packages/database/prisma/zod/index.js:34:31  ━━━━━━━━━━━━━━━━━━━

✖ This var should be declared at the root of the enclosing function.

    32 │         if (mod && mod.__esModule) return mod;
    33 │         var result = {};
> 34 │         if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
│                               ^^^^^^^^^^^^^^^^^^^^^^^^^^^
35 │         __setModuleDefault(result, mod);
36 │         return result;

ℹ The var is accessible in the whole body of the enclosing function.
To avoid confusion, it should be declared at the root of the enclosing function.


packages/database/prisma/zod/index.js:7:27  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✖ Assigning a function parameter is confusing.

    5 │  */
    6 │ var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
> 7 │     if (k2 === undefined) k2 = k;
│                           ^^
8 │     var desc = Object.getOwnPropertyDescriptor(m, k);
9 │     if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {

ℹ The parameter is declared here:

    4 │  * Auto-generated. Do not edit.
    5 │  */
> 6 │ var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
│                                                                                             ^^
7 │     if (k2 === undefined) k2 = k;
8 │     var desc = Object.getOwnPropertyDescriptor(m, k);

ℹ Developers usually expect function parameters to be readonly. To align with this expectation, use a local variable instead.


packages/database/prisma/zod/index.js:14:27  ━━━━━━━━━━━━━━━━━━━━━━━━━━━

✖ Assigning a function parameter is confusing.

    12 │     Object.defineProperty(o, k2, desc);
    13 │ }) : (function(o, m, k, k2) {
> 14 │     if (k2 === undefined) k2 = k;
│                           ^^
15 │     o[k2] = m[k];
16 │ }));

ℹ The parameter is declared here:

    11 │     }
    12 │     Object.defineProperty(o, k2, desc);
> 13 │ }) : (function(o, m, k, k2) {
│                         ^^
14 │     if (k2 === undefined) k2 = k;
15 │     o[k2] = m[k];

ℹ Developers usually expect function parameters to be readonly. To align with this expectation, use a local variable instead.


ci ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✖ Some errors were emitted while running checks.


Checked 471 files in 321ms. No fixes applied.
Found 18 errors.
Found 59 warnings.
Error: Process completed with exit code 1.

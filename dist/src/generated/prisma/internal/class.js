"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPrismaClientClass = getPrismaClientClass;
const runtime = __importStar(require("@prisma/client/runtime/client"));
const config = {
    "previewFeatures": [],
    "clientVersion": "7.6.0",
    "engineVersion": "75cbdc1eb7150937890ad5465d861175c6624711",
    "activeProvider": "postgresql",
    "inlineSchema": "// This is your Prisma schema file,\n// learn more about it in the docs: https://pris.ly/d/prisma-schema\n\n// Get a free hosted Postgres database in seconds: `npx create-db`\n\ngenerator client {\n  provider = \"prisma-client\"\n  output   = \"../src/generated/prisma\"\n}\n\ndatasource db {\n  provider = \"postgresql\"\n}\n\nmodel User {\n  id              String    @id @default(uuid())\n  email           String    @unique\n  firstName       String?\n  lastName        String?\n  role            String    @default(\"USER\")\n  passwordHash    String\n  isActive        Boolean   @default(true)\n  isEmailVerified Boolean   @default(false)\n  createdAt       DateTime  @default(now())\n  updatedAt       DateTime  @updatedAt\n  deletedAt       DateTime?\n\n  @@map(\"users\")\n}\n",
    "runtimeDataModel": {
        "models": {},
        "enums": {},
        "types": {}
    },
    "parameterizationSchema": {
        "strings": [],
        "graph": ""
    }
};
config.runtimeDataModel = JSON.parse("{\"models\":{\"User\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"email\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"firstName\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"lastName\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"role\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"passwordHash\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"isActive\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"isEmailVerified\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"deletedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":\"users\"}},\"enums\":{},\"types\":{}}");
config.parameterizationSchema = {
    strings: JSON.parse("[\"where\",\"User.findUnique\",\"User.findUniqueOrThrow\",\"orderBy\",\"cursor\",\"User.findFirst\",\"User.findFirstOrThrow\",\"User.findMany\",\"data\",\"User.createOne\",\"User.createMany\",\"User.createManyAndReturn\",\"User.updateOne\",\"User.updateMany\",\"User.updateManyAndReturn\",\"create\",\"update\",\"User.upsertOne\",\"User.deleteOne\",\"User.deleteMany\",\"having\",\"_count\",\"_min\",\"_max\",\"User.groupBy\",\"User.aggregate\",\"AND\",\"OR\",\"NOT\",\"id\",\"email\",\"firstName\",\"lastName\",\"role\",\"passwordHash\",\"isActive\",\"isEmailVerified\",\"createdAt\",\"updatedAt\",\"deletedAt\",\"equals\",\"in\",\"notIn\",\"lt\",\"lte\",\"gt\",\"gte\",\"not\",\"contains\",\"startsWith\",\"endsWith\",\"set\"]"),
    graph: "OgkQDhoAACwAMBsAAAQAEBwAACwAMB0BAAAAAR4BAAAAAR8BAC4AISABAC4AISEBAC0AISIBAC0AISMgAC8AISQgAC8AISVAADAAISZAADAAISdAADEAIQEAAAABACABAAAAAQAgDhoAACwAMBsAAAQAEBwAACwAMB0BAC0AIR4BAC0AIR8BAC4AISABAC4AISEBAC0AISIBAC0AISMgAC8AISQgAC8AISVAADAAISZAADAAISdAADEAIQMfAAAyACAgAAAyACAnAAAyACADAAAABAAgAwAABQAwBAAAAQAgAwAAAAQAIAMAAAUAMAQAAAEAIAMAAAAEACADAAAFADAEAAABACALHQEAAAABHgEAAAABHwEAAAABIAEAAAABIQEAAAABIgEAAAABIyAAAAABJCAAAAABJUAAAAABJkAAAAABJ0AAAAABAQgAAAkAIAsdAQAAAAEeAQAAAAEfAQAAAAEgAQAAAAEhAQAAAAEiAQAAAAEjIAAAAAEkIAAAAAElQAAAAAEmQAAAAAEnQAAAAAEBCAAACwAwAQgAAAsAMAsdAQA2ACEeAQA2ACEfAQA3ACEgAQA3ACEhAQA2ACEiAQA2ACEjIAA4ACEkIAA4ACElQAA5ACEmQAA5ACEnQAA6ACECAAAAAQAgCAAADgAgCx0BADYAIR4BADYAIR8BADcAISABADcAISEBADYAISIBADYAISMgADgAISQgADgAISVAADkAISZAADkAISdAADoAIQIAAAAEACAIAAAQACACAAAABAAgCAAAEAAgAwAAAAEAIA8AAAkAIBAAAA4AIAEAAAABACABAAAABAAgBhUAADMAIBYAADUAIBcAADQAIB8AADIAICAAADIAICcAADIAIA4aAAAaADAbAAAXABAcAAAaADAdAQAbACEeAQAbACEfAQAcACEgAQAcACEhAQAbACEiAQAbACEjIAAdACEkIAAdACElQAAeACEmQAAeACEnQAAfACEDAAAABAAgAwAAFgAwFAAAFwAgAwAAAAQAIAMAAAUAMAQAAAEAIA4aAAAaADAbAAAXABAcAAAaADAdAQAbACEeAQAbACEfAQAcACEgAQAcACEhAQAbACEiAQAbACEjIAAdACEkIAAdACElQAAeACEmQAAeACEnQAAfACEOFQAAJAAgFgAAKwAgFwAAKwAgKAEAAAABKQEAAAAEKgEAAAAEKwEAAAABLAEAAAABLQEAAAABLgEAAAABLwEAKgAhMAEAAAABMQEAAAABMgEAAAABDhUAACEAIBYAACkAIBcAACkAICgBAAAAASkBAAAABSoBAAAABSsBAAAAASwBAAAAAS0BAAAAAS4BAAAAAS8BACgAITABAAAAATEBAAAAATIBAAAAAQUVAAAkACAWAAAnACAXAAAnACAoIAAAAAEvIAAmACELFQAAJAAgFgAAJQAgFwAAJQAgKEAAAAABKUAAAAAEKkAAAAAEK0AAAAABLEAAAAABLUAAAAABLkAAAAABL0AAIwAhCxUAACEAIBYAACIAIBcAACIAIChAAAAAASlAAAAABSpAAAAABStAAAAAASxAAAAAAS1AAAAAAS5AAAAAAS9AACAAIQsVAAAhACAWAAAiACAXAAAiACAoQAAAAAEpQAAAAAUqQAAAAAUrQAAAAAEsQAAAAAEtQAAAAAEuQAAAAAEvQAAgACEIKAIAAAABKQIAAAAFKgIAAAAFKwIAAAABLAIAAAABLQIAAAABLgIAAAABLwIAIQAhCChAAAAAASlAAAAABSpAAAAABStAAAAAASxAAAAAAS1AAAAAAS5AAAAAAS9AACIAIQsVAAAkACAWAAAlACAXAAAlACAoQAAAAAEpQAAAAAQqQAAAAAQrQAAAAAEsQAAAAAEtQAAAAAEuQAAAAAEvQAAjACEIKAIAAAABKQIAAAAEKgIAAAAEKwIAAAABLAIAAAABLQIAAAABLgIAAAABLwIAJAAhCChAAAAAASlAAAAABCpAAAAABCtAAAAAASxAAAAAAS1AAAAAAS5AAAAAAS9AACUAIQUVAAAkACAWAAAnACAXAAAnACAoIAAAAAEvIAAmACECKCAAAAABLyAAJwAhDhUAACEAIBYAACkAIBcAACkAICgBAAAAASkBAAAABSoBAAAABSsBAAAAASwBAAAAAS0BAAAAAS4BAAAAAS8BACgAITABAAAAATEBAAAAATIBAAAAAQsoAQAAAAEpAQAAAAUqAQAAAAUrAQAAAAEsAQAAAAEtAQAAAAEuAQAAAAEvAQApACEwAQAAAAExAQAAAAEyAQAAAAEOFQAAJAAgFgAAKwAgFwAAKwAgKAEAAAABKQEAAAAEKgEAAAAEKwEAAAABLAEAAAABLQEAAAABLgEAAAABLwEAKgAhMAEAAAABMQEAAAABMgEAAAABCygBAAAAASkBAAAABCoBAAAABCsBAAAAASwBAAAAAS0BAAAAAS4BAAAAAS8BACsAITABAAAAATEBAAAAATIBAAAAAQ4aAAAsADAbAAAEABAcAAAsADAdAQAtACEeAQAtACEfAQAuACEgAQAuACEhAQAtACEiAQAtACEjIAAvACEkIAAvACElQAAwACEmQAAwACEnQAAxACELKAEAAAABKQEAAAAEKgEAAAAEKwEAAAABLAEAAAABLQEAAAABLgEAAAABLwEAKwAhMAEAAAABMQEAAAABMgEAAAABCygBAAAAASkBAAAABSoBAAAABSsBAAAAASwBAAAAAS0BAAAAAS4BAAAAAS8BACkAITABAAAAATEBAAAAATIBAAAAAQIoIAAAAAEvIAAnACEIKEAAAAABKUAAAAAEKkAAAAAEK0AAAAABLEAAAAABLUAAAAABLkAAAAABL0AAJQAhCChAAAAAASlAAAAABSpAAAAABStAAAAAASxAAAAAAS1AAAAAAS5AAAAAAS9AACIAIQAAAAABMwEAAAABATMBAAAAAQEzIAAAAAEBM0AAAAABATNAAAAAAQAAAAADFQAGFgAHFwAIAAAAAxUABhYABxcACAECAQIDAQUGAQYHAQcIAQkKAQoMAgsNAwwPAQ0RAg4SBBETARIUARMVAhgYBRkZCQ"
};
async function decodeBase64AsWasm(wasmBase64) {
    const { Buffer } = await import('node:buffer');
    const wasmArray = Buffer.from(wasmBase64, 'base64');
    return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
    getRuntime: async () => await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.mjs"),
    getQueryCompilerWasmModule: async () => {
        const { wasm } = await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.mjs");
        return await decodeBase64AsWasm(wasm);
    },
    importName: "./query_compiler_fast_bg.js"
};
function getPrismaClientClass() {
    return runtime.getPrismaClient(config);
}
//# sourceMappingURL=class.js.map
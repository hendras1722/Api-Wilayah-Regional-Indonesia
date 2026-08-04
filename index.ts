import type { BunRequest } from "bun";

// ---------- Types ----------
interface Province {
    id: string;
    name: string;
    [key: string]: unknown;
}

interface Regency {
    id: string;
    province_id: string;
    name: string;
    [key: string]: unknown;
}

interface District {
    id: string;
    regency_id: string;
    name: string;
    [key: string]: unknown;
}

interface Village {
    id: string;
    district_id: string;
    name: string;
    [key: string]: unknown;
}

// ---------- Response helpers ----------
function ok(message: string, data: unknown, status = 200) {
    return Response.json({ message, data }, { status });
}

function fail(message: string, error: unknown, status = 500) {
    const errMessage =
        error instanceof Error ? error.message : String(error);
    return Response.json({ message, data: { error: errMessage } }, { status });
}

// Wraps a handler so we don't repeat try/catch everywhere.
// If handler returns `undefined`/`null`, treat as "not found".
function withErrorHandling<T>(
    successMessage: string,
    failMessage: string,
    handler: (req: T) => unknown | Promise<unknown>
) {
    return async (req: T) => {
        try {
            const data = await handler(req);
            if (data === undefined || data === null) {
                return ok(successMessage, null, 404);
            }
            return ok(successMessage, data, 200);
        } catch (error) {
            return fail(failMessage, error, 500);
        }
    };
}

// ---------- Load data once at startup ----------
async function loadJson<T>(path: string): Promise<T> {
    const file = Bun.file(path);
    return file.json() as Promise<T>;
}

const [provincesRaw, regenciesRaw, districtsRaw, villagesRaw] =
    await Promise.all([
        loadJson<Province[]>("./data/provinces.json"),
        loadJson<Regency[]>("./data/regencies.json"),
        loadJson<District[]>("./data/districts.json"),
        loadJson<Village[]>("./data/villages.json"),
    ]);

// ---------- Build indexes (O(1) lookup instead of scanning every request) ----------
const provincesById = new Map<number, Province>();
for (const p of provincesRaw) {
    provincesById.set(Number(p.id ?? 0), p);
}

function groupBy<T>(items: T[], keyFn: (item: T) => number): Map<number, T[]> {
    const map = new Map<number, T[]>();
    for (const item of items) {
        const key = keyFn(item);
        const list = map.get(key);
        if (list) {
            list.push(item);
        } else {
            map.set(key, [item]);
        }
    }
    return map;
}

const regenciesByProvinceId = groupBy(regenciesRaw, (r) =>
    Number(r.province_id ?? 0)
);
const districtsByRegencyId = groupBy(districtsRaw, (d) =>
    Number(d.regency_id ?? 0)
);
const villagesByDistrictId = groupBy(villagesRaw, (v) =>
    Number(v.district_id ?? 0)
);

console.log(
    `Loaded ${provincesRaw.length} provinces, ${regenciesRaw.length} regencies, ` +
    `${districtsRaw.length} districts, ${villagesRaw.length} villages into memory.`
);

// ---------- Server ----------
const server = Bun.serve({
    port: 3002,
    routes: {
        "/api/health": new Response("Pong Ping"),

        "/api/provinces": withErrorHandling(
            "Berhasil Menampilkan Provinsi",
            "Gagal Menampilkan Provinsi",
            () => provincesRaw
        ),

        "/api/province/:id": withErrorHandling(
            "Berhasil Menampilkan Provinsi",
            "Gagal Menampilkan Provinsi",
            (req: BunRequest<"/api/province/:id">) => {
                const { id } = req.params;
                return provincesById.get(Number(id ?? 0));
            }
        ),

        "/api/regencies/:idProvince": withErrorHandling(
            "Berhasil Menampilkan Kabupaten",
            "Gagal Menampilkan Kabupaten",
            (req: BunRequest<"/api/regencies/:idProvince">) => {
                const { idProvince } = req.params;
                return regenciesByProvinceId.get(Number(idProvince ?? 0)) ?? [];
            }
        ),

        "/api/district/:regencyId": withErrorHandling(
            "Berhasil Menampilkan Kecamatan",
            "Gagal Menampilkan Kecamatan",
            (req: BunRequest<"/api/district/:regencyId">) => {
                const { regencyId } = req.params;
                return districtsByRegencyId.get(Number(regencyId ?? 0)) ?? [];
            }
        ),

        "/api/village/:districtId": withErrorHandling(
            "Berhasil Menampilkan Desa",
            "Gagal Menampilkan Desa",
            (req: BunRequest<"/api/village/:districtId">) => {
                const { districtId } = req.params;
                return villagesByDistrictId.get(Number(districtId ?? 0)) ?? [];
            }
        ),
    },

    fetch(req) {
        return new Response("Not Found", { status: 404 });
    },
});

console.log(`Server running at ${server.url}`);
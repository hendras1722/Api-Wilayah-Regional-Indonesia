# API Wilayah Indonesia

REST API sederhana untuk data wilayah administratif Indonesia (Provinsi, Kabupaten/Kota, Kecamatan, dan Desa/Kelurahan), dibangun dengan [Bun](https://bun.com) menggunakan `Bun.serve()` tanpa framework tambahan (tanpa Express).

Seluruh data dimuat ke memori saat server start dan diindeks (`Map`) agar setiap pencarian berjalan O(1), sehingga response tetap cepat meskipun datanya besar.

## Instalasi

```bash
bun install
```

## Menjalankan

Mode development (auto-reload):

```bash
bun run dev
```

Build untuk production:

```bash
bun run build
```

Menjalankan hasil build:

```bash
bun run start
```

Server berjalan di `http://localhost:3002` secara default.

## Endpoints

Semua response berbentuk JSON dengan struktur:

```json
{
  "message": "string",
  "data": "..."
}
```

Jika data tidak ditemukan, response tetap `200` dengan `data: null` dan status HTTP `404` pada kode status endpoint tersebut.

| Method | Endpoint                        | Deskripsi                                         |
| ------ | -------------------------------- | -------------------------------------------------- |
| GET    | `/api/health`                    | Health check, membalas `Pong Ping`                  |
| GET    | `/api/provinces`                 | Daftar seluruh provinsi                             |
| GET    | `/api/province/:id`              | Detail satu provinsi berdasarkan `id`               |
| GET    | `/api/regencies/:idProvince`     | Daftar kabupaten/kota dalam sebuah provinsi          |
| GET    | `/api/district/:regencyId`       | Daftar kecamatan dalam sebuah kabupaten/kota         |
| GET    | `/api/village/:districtId`       | Daftar desa/kelurahan dalam sebuah kecamatan         |

### Contoh

```bash
curl http://localhost:3002/api/provinces
curl http://localhost:3002/api/province/11
curl http://localhost:3002/api/regencies/11
curl http://localhost:3002/api/district/1101
curl http://localhost:3002/api/village/1101010
```

## Struktur Data

Data mentah berada di folder `data/` (format JSON):

- `provinces.json` — `{ id, name }`
- `regencies.json` — `{ id, province_id, name }`
- `districts.json` — `{ id, regency_id, name }`
- `villages.json` — `{ id, district_id, name }`

## Docker

Image dibangun menggunakan `Dockerfile` multi-stage (install → build → release) berbasis `oven/bun:1`.

```bash
docker build -t api-regions .
docker run -p 3000:3000 api-regions
```

Deployment otomatis ke VPS dilakukan melalui GitHub Actions (`.github/workflows/deploy.yml`) setiap push ke branch `master`.

## Tech Stack

- [Bun](https://bun.com) — runtime & bundler
- TypeScript
- `Bun.serve()` untuk HTTP server (tanpa Express)

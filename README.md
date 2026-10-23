# API Wilayah Indonesia

REST API sederhana untuk data wilayah administratif Indonesia (Provinsi, Kabupaten/Kota, Kecamatan, dan Desa/Kelurahan), dibangun dengan [Bun](https://bun.com) menggunakan `Bun.serve()` tanpa framework tambahan (tanpa Express).

**Live API**: [https://regions.syahendra.com/](https://regions.syahendra.com/)

Seluruh data dimuat ke memori saat server start dan diindeks (`Map`) agar setiap pencarian berjalan O(1), sehingga response tetap cepat meskipun datanya besar.

## Endpoints

Semua response berbentuk JSON dengan struktur:

```json
{
  "message": "string",
  "data": "..."
}
```

Jika data tidak ditemukan, response tetap `200` dengan `data: null` dan status HTTP `404` pada kode status endpoint tersebut.

| Method | Endpoint                                                  | Deskripsi                                    |
| ------ | --------------------------------------------------------- | -------------------------------------------- |
| GET    | `https://regions.syahendra.com/api/health`                | Health check, membalas `Pong Ping`           |
| GET    | `https://regions.syahendra.com/api/provinces`             | Daftar seluruh provinsi                      |
| GET    | `https://regions.syahendra.com/api/province/:id`          | Detail satu provinsi berdasarkan `id`        |
| GET    | `https://regions.syahendra.com/api/regencies/:idProvince` | Daftar kabupaten/kota dalam sebuah provinsi  |
| GET    | `https://regions.syahendra.com/api/district/:regencyId`   | Daftar kecamatan dalam sebuah kabupaten/kota |
| GET    | `https://regions.syahendra.com/api/village/:districtId`   | Daftar desa/kelurahan dalam sebuah kecamatan |

### Contoh

```bash
curl https://regions.syahendra.com/api/provinces
curl https://regions.syahendra.com/api/province/11
curl https://regions.syahendra.com/api/regencies/11
curl https://regions.syahendra.com/api/district/1101
curl https://regions.syahendra.com/api/village/1101010
```

## Struktur Data

Data mentah berada di folder `data/` (format JSON):

- `provinces.json` — `{ id, name }`
- `regencies.json` — `{ id, province_id, name }`
- `districts.json` — `{ id, regency_id, name }`
- `villages.json` — `{ id, district_id, name }`

## Tech Stack

- [Bun](https://bun.com) — runtime & bundler
- TypeScript
- `Bun.serve()` untuk HTTP server (tanpa Express)

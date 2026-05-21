---
title: สถานะการแปลภาษาไทย
type: status
tags:
  - i18n
  - thai
  - status
status: published
---

# สถานะการแปลภาษาไทย

**Last upstream sync**: tag `v1.0.0` (2026-05-21)

## สัญลักษณ์สถานะ

| สัญลักษณ์ | ความหมาย |
| :---: | :--- |
| ✅ | แปลเสร็จและ sync กับต้นฉบับภาษาอังกฤษ |
| 🔄 | ต้นฉบับภาษาอังกฤษเปลี่ยนหลังจากแปลเสร็จ — ต้อง update |
| ⏳ | ยังไม่ได้แปล |
| ❌ | นโยบายไม่แปล (เช่น `LICENSE`, `CHANGELOG.md`) |

## ภาพรวม

| หมวด | จำนวนไฟล์ | แปลแล้ว | ค้าง |
| :--- | :---: | :---: | :---: |
| **Top-level** | 7 | 0 | 5 (อีก 2 ❌) |
| **i18n/th/** (ไฟล์ scaffolding) | 3 | 3 | 0 |
| **Data Engineer Associate** | 41 | 0 | 41 |
| **Data Engineer Professional** | 98 | 0 | 98 |
| **Data Analyst Associate** | 44 | 0 | 44 |
| **ML Associate** | 31 | 0 | 31 |
| **ML Professional** | 34 | 0 | 34 |
| **GenAI Engineer Associate** | 37 | 0 | 37 |
| **Shared — Fundamentals** | 16 | 0 | 16 |
| **Shared — Cheat Sheets** | 13 | 0 | 13 |
| **Shared — Interview Prep** | 16 | 0 | 16 |
| **Shared — Appendix** | 7 | 0 | 7 |
| **Shared — Code Examples** | 15 | 0 | 15 |
| **Labs** | 6 | 0 | 6 |
| **Learning Paths** | 6 | 0 | 6 |
| **รวม (in scope)** | **374** | **3** | **369 (+ 2 ❌)** |

ความคืบหน้า: **0.8 %** (เป้าหมายระยะแรกคือ Top-level README + Data Engineer Associate cert ครบ)

## Top-level

| ไฟล์ | สถานะ |
| :--- | :---: |
| `README.md` | ⏳ |
| `CONTRIBUTING.md` | ⏳ |
| `OBSIDIAN-SETUP.md` | ⏳ |
| `CONTRIBUTORS.md` | ⏳ (optional — เพราะเป็นรายชื่อ) |
| `TRANSLATING.md` | ❌ นโยบาย |
| `LICENSE` | ❌ นโยบาย (ข้อความทางกฎหมาย) |
| `CHANGELOG.md` | ❌ นโยบาย |
| `CLAUDE.md` | ❌ นโยบาย |

## i18n/th/ (ไฟล์ scaffolding ของการแปลเอง)

| ไฟล์ | สถานะ |
| :--- | :---: |
| `i18n/th/README.md` | ✅ |
| `i18n/th/glossary.md` | ✅ |
| `i18n/th/STATUS.md` | ✅ (ไฟล์นี้) |

## ลำดับความสำคัญในการแปล (แนะนำ)

ถ้าจะแปลเอง ทำตามลำดับนี้เพื่อให้ผู้อ่านได้ประโยชน์เร็วที่สุด:

1. **Top-level `README.md`** — landing page ของทั้ง repo (มีคนเข้าถึงเยอะที่สุด)
2. **`shared/fundamentals/`** ทั้ง 16 ไฟล์ — concept พื้นฐานที่ใช้ข้าม cert
3. **DE Associate** — cert ที่คนไทยสอบเยอะที่สุด เริ่มจาก:
   - `certifications/data-engineer-associate/README.md`
   - แต่ละ topic folder ตามลำดับ (`01-` → `06-`)
   - `resources/exam-tips.md`
   - `resources/final-review.md`
   - `resources/mock-exam/questions.md` + `answer-key.md`
4. **`shared/cheat-sheets/`** — cheat sheets ที่ใช้กับทุก cert
5. **`shared/appendix/renewal-guide.md`** — สำคัญสำหรับคนที่ใกล้หมดอายุ cert
6. **DA Associate** — รองลงมาในความนิยม
7. **ML Associate / GenAI Engineer Associate**
8. **DE Professional / ML Professional** — Professional certs (สัดส่วนคนสอบน้อยกว่า)

> [!tip]
> ไม่จำเป็นต้องแปลทั้งหมด การแปล **DE Associate ครบ + fundamentals หลักๆ** ก็ครอบคลุมประมาณ 70 % ของคนที่จะใช้คู่มือนี้

## ไฟล์ที่กำลังจะแปล (ใส่ชื่อตัวเองตรงนี้เพื่อจอง)

| ไฟล์ | ผู้แปล | คาดว่าจะเสร็จ |
| :--- | :--- | :--- |
| _ยังไม่มีใครรับ — มาเป็นคนแรก!_ | | |

## วิธี update STATUS.md ใน PR

ทุกครั้งที่แปลไฟล์เสร็จ:

1. หา section ของ cert/หมวดที่ตรงกับไฟล์
2. เปลี่ยนสัญลักษณ์จาก ⏳ เป็น ✅
3. Update ตาราง "ภาพรวม" — ตัวเลข "แปลแล้ว" และ "ค้าง"
4. ลบชื่อตัวเองจากตาราง "ไฟล์ที่กำลังจะแปล" ถ้าเคยจองไว้
5. Update field `Last upstream sync` ที่ด้านบนของไฟล์นี้ถ้า rebase จาก tag ใหม่

---

**[← กลับไปหน้าหลักภาษาไทย](./README.md)** | **[คำศัพท์มาตรฐาน →](./glossary.md)**

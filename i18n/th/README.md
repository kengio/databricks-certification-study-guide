---
title: คู่มือเตรียมสอบ Databricks Certification (ภาษาไทย)
type: index
tags:
  - databricks
  - certification
  - thai
status: published
---

# คู่มือเตรียมสอบ Databricks Certification — ภาษาไทย

นี่คือเวอร์ชันภาษาไทยของ [Databricks Certification Study Guide](../../README.md) เนื้อหาภาษาอังกฤษเป็น source of truth — เวอร์ชันไทยตามทันด้วยการแปลจากภาษาอังกฤษเป็นรายไฟล์

> [!info]
> **สถานะการแปล**: กำลังดำเนินการ ดูความคืบหน้ารายไฟล์ที่ [`STATUS.md`](./STATUS.md)
>
> ถ้าไฟล์ที่คุณต้องการอ่านยังไม่ได้แปล กรุณาไปอ่านเวอร์ชันภาษาอังกฤษที่ตำแหน่งเดียวกันใน repo (เพียงตัด `i18n/th/` ออกจาก path) — เนื้อหาภาษาอังกฤษพร้อมใช้งานเต็มทุกหัวข้อ

## ทำไมต้องมีเวอร์ชันภาษาไทย

ผู้สอบ Databricks Certification ในไทยส่วนใหญ่อ่านภาษาอังกฤษได้ แต่การมีคู่มือภาษาไทยช่วยให้:

- เข้าใจ concept ใหม่ๆ ได้เร็วขึ้น (อ่านภาษาแม่ก่อน แล้วค่อย map กับศัพท์อังกฤษ)
- จำคำศัพท์ technical ภาษาอังกฤษได้แม่นขึ้น (เห็นทั้งสองภาษาเทียบกัน)
- เผยแพร่ความรู้ในชุมชนคนไทยที่ทำงานด้าน data engineering / ML ได้ง่ายขึ้น

> [!important]
> **ข้อสอบจริงเป็นภาษาอังกฤษ** ดังนั้นชื่อ product (Delta Lake, Unity Catalog, Lakeflow Jobs, MLflow, ...) จะคงภาษาอังกฤษเสมอในคู่มือนี้ ดู[นโยบายการแปล](#นโยบายการแปล)และ[คำศัพท์มาตรฐาน](./glossary.md)

## การสอบที่ครอบคลุม

ครอบคลุมทั้ง 6 certification ของ Databricks (ข้อมูลอัพเดต ณ พฤษภาคม 2026):

| Certification | ระดับ | ค่าสอบ | เวลา | จำนวนข้อ | Blueprint ล่าสุด |
| :--- | :---: | :---: | :---: | :---: | :---: |
| [Data Engineer Associate](../../certifications/data-engineer-associate/README.md) | Associate | $200 | 90 นาที | 45 | พ.ค. 2026 |
| [Data Engineer Professional](../../certifications/data-engineer-professional/README.md) | Professional | $200 | 120 นาที | 60 | 30 พ.ย. 2025 |
| [Data Analyst Associate](../../certifications/data-analyst-associate/README.md) | Associate | $200 | 90 นาที | 45 | ต.ค. 2025 |
| [ML Associate](../../certifications/ml-associate/README.md) | Associate | $200 | 90 นาที | 45 | 1 มี.ค. 2025 |
| [ML Professional](../../certifications/ml-professional/README.md) | Professional | $200 | 120 นาที | 59 | ก.ย. 2025 |
| [GenAI Engineer Associate](../../certifications/genai-engineer-associate/README.md) | Associate | $200 | 90 นาที | 45 | มี.ค. 2026 |

ข้อมูลร่วมของทุก certification:

- **เกณฑ์ผ่าน**: Databricks ไม่เปิดเผยคะแนนผ่าน — ระบบเป็นแบบผ่าน/ไม่ผ่าน
- **รูปแบบข้อสอบ**: ปรนัย (multiple choice) สอบออนไลน์หรือที่ศูนย์สอบ
- **อายุ certification**: 2 ปี ดูวิธีต่ออายุที่ [Renewal Guide](../../shared/appendix/renewal-guide.md) (ภาษาอังกฤษ)
- **ไม่มี prerequisite อย่างเป็นทางการ** — แต่ Databricks แนะนำประสบการณ์ hands-on และคอร์สใน [Databricks Academy](https://www.databricks.com/learn/training)
- **ภาษาที่สอบได้**: ทุก exam สอบเป็นภาษาอังกฤษ บางตัวมี Japanese / Portuguese (BR) / Korean เพิ่ม **แต่ไม่มี Thai** ในข้อสอบ — นี่คือเหตุผลที่คู่มือฉบับแปลนี้สำคัญ

## วิธีใช้คู่มือนี้

1. **เริ่มจาก[เส้นทางการเรียนรู้ (learning path)](../../learning-paths/README.md)** เพื่อเลือก certification ที่เหมาะกับ role ของคุณ (ภาษาอังกฤษ — ยังไม่ได้แปล)
2. **อ่าน[ไฟล์ README ของ certification](#การสอบที่ครอบคลุม)** ที่เลือก เพื่อดูโครงสร้าง domain และน้ำหนักคะแนน
3. **เรียนตามลำดับ folder** (`01-` → `02-` → ...) แต่ละ folder มี README.md เป็น index
4. **ทำ practice questions ระหว่างเรียน** เพื่อทดสอบความเข้าใจ
5. **ทำ mock exam 2 ชุดต่อ cert** ก่อนสอบจริง — ดูที่ `resources/mock-exam/` และ `resources/mock-exam-2/`
6. **อ่าน final-review file** ในเช้าวันสอบ — 20 นาทีอ่านสรุปทุก concept สำคัญ

## เนื้อหาที่แบ่งปันระหว่าง certification (shared/)

เนื้อหาที่ใช้ได้กับหลาย certification:

- **[Fundamentals](../../shared/fundamentals/)** — พื้นฐานข้าม cert: Platform Architecture, Delta Lake, Spark, Unity Catalog, Medallion Architecture, MLflow, RAG/Vector Search, Python essentials
- **[Cheat Sheets](../../shared/cheat-sheets/)** — สรุป commands และ syntax สำหรับ Delta Lake, Lakeflow Declarative Pipelines, MLflow, PySpark, SQL functions, Unity Catalog
- **[Interview Prep](../../shared/interview-prep/)** — คำถามแบบ open-ended สำหรับเตรียมสัมภาษณ์งาน (16 หัวข้อ)
- **[Appendix](../../shared/appendix/)** — Glossary, ตารางเปรียบเทียบ, error messages, troubleshooting, **[Renewal Guide](../../shared/appendix/renewal-guide.md)**

## นโยบายการแปล

- **ชื่อ product ของ Databricks คงภาษาอังกฤษเสมอ** (Delta Lake, Unity Catalog, Lakeflow Jobs, MLflow, ...) เพราะข้อสอบใช้ภาษาอังกฤษ
- **Code blocks ไม่แปล** — Python / SQL / Scala code คงเดิมตามต้นฉบับ
- **คำศัพท์ technical** ปฏิบัติตาม [glossary.md](./glossary.md) — ห้ามแปลแบบ ad-hoc
- **ไฟล์และ folder name ใช้ ASCII ภาษาอังกฤษ** เหมือนต้นฉบับ — ไม่เปลี่ยน path เพื่อให้ link เทียบกันได้ง่าย

ดูรายละเอียดทั้งหมดที่ [`TRANSLATING.md`](../../TRANSLATING.md) (ภาษาอังกฤษ)

## ร่วมแปล

หากคุณอยากช่วยแปล:

1. หาไฟล์ที่สถานะเป็น ⏳ ใน [`STATUS.md`](./STATUS.md)
2. อ่านไฟล์ภาษาอังกฤษต้นฉบับ
3. แปลตาม [glossary](./glossary.md) และ[นโยบายการแปล](../../TRANSLATING.md)
4. Update `STATUS.md` ในไฟล์เดียวกับ PR
5. เปิด PR — review จะใช้เวลาไม่นาน เพราะ maintainer อ่านไทยได้

โครงการนี้ยินดีรับ contributor ไทยทุกระดับ — ตั้งแต่แก้คำผิดไปจนถึงแปลทั้ง cert track

## License

[MIT License](../../LICENSE) — เหมือนกับเวอร์ชันภาษาอังกฤษ

## ภาษาอื่น

ดูภาษาอื่น (community forks) ที่ [`i18n/README.md`](../README.md) ปัจจุบันยังไม่มีภาษาอื่นที่ register เข้ามา

---

**[← Back to English README](../../README.md)** | **[คำศัพท์มาตรฐาน →](./glossary.md)** | **[สถานะการแปล →](./STATUS.md)**

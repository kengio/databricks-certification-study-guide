---
title: Thai Translation Glossary
type: glossary
tags:
  - i18n
  - thai
  - glossary
status: published
---

# คำศัพท์มาตรฐานสำหรับการแปลภาษาไทย

มาตรฐานเดียวสำหรับการแปลคำศัพท์ Databricks / Spark / Data Engineering / ML ในไฟล์ภายใต้ `i18n/th/` ทุก PR ที่แปลภาษาไทยต้องสอดคล้องกับตารางนี้

หลักการ:

1. **ชื่อ product ของ Databricks ใช้ภาษาอังกฤษเสมอ** — เช่น Delta Lake, Unity Catalog, Lakeflow Jobs (เพราะข้อสอบจริงใช้ภาษาอังกฤษ)
2. **คำที่ใช้ในวงกว้างใน data engineering** — ใช้คำทับศัพท์ที่ผู้อ่านคุ้นเคย (เช่น "คลัสเตอร์", "ไปป์ไลน์")
3. **คำที่มีความหมายในภาษาไทยชัดเจน** — แปลตามความหมาย (เช่น "schema" → "สคีมา" หรือใช้คำว่า "โครงสร้าง" ขึ้นกับบริบท)
4. **ถ้าไม่แน่ใจ** — ใส่ภาษาอังกฤษในวงเล็บหลังคำไทยครั้งแรกที่พูดถึงในไฟล์: `"การประมวลผลแบบกลุ่ม (batch processing)"`

## คำศัพท์เฉพาะ Databricks (เก็บภาษาอังกฤษเสมอ)

| ภาษาอังกฤษ | นโยบาย | หมายเหตุ |
| :--- | :--- | :--- |
| Delta Lake | คงภาษาอังกฤษ | |
| Unity Catalog (UC) | คงภาษาอังกฤษ | ใช้ตัวย่อ UC ได้หลังจากระบุชื่อเต็มครั้งแรก |
| Lakeflow Declarative Pipelines | คงภาษาอังกฤษ | ชื่อใหม่ของ Delta Live Tables (DLT) |
| Lakeflow Jobs | คงภาษาอังกฤษ | ชื่อใหม่ของ Databricks Workflows |
| MLflow | คงภาษาอังกฤษ | |
| Mosaic AI | คงภาษาอังกฤษ | รวม Model Serving, Agent Framework, AI Gateway, Vector Search |
| Databricks Runtime (DBR) | คงภาษาอังกฤษ | |
| Photon | คงภาษาอังกฤษ | |
| AutoML | คงภาษาอังกฤษ | |
| AI Gateway | คงภาษาอังกฤษ | |
| Genie Spaces | คงภาษาอังกฤษ | |
| Vector Search | คงภาษาอังกฤษ | |
| Inference Tables | คงภาษาอังกฤษ | |
| Feature Engineering in UC | คงภาษาอังกฤษ | (ชื่อ feature ใหม่แทนที่ Feature Store) |
| Auto Loader | คงภาษาอังกฤษ | |
| Z-ordering | คงภาษาอังกฤษ | สามารถใส่คำอธิบายภายในวงเล็บได้: `Z-ordering (การจัดเรียงข้อมูลแบบ Z-order)` |
| Liquid Clustering | คงภาษาอังกฤษ | |
| Time Travel | คงภาษาอังกฤษ | |
| Photon engine | คงภาษาอังกฤษ | |

## คำศัพท์ Data Engineering / Spark / SQL ทั่วไป

| ภาษาอังกฤษ | คำแปลภาษาไทยมาตรฐาน | หมายเหตุ |
| :--- | :--- | :--- |
| Cluster | คลัสเตอร์ | |
| Pipeline | ไปป์ไลน์ | ใช้คำทับศัพท์ ไม่ใช้ "ท่อข้อมูล" |
| Notebook | โน้ตบุ๊ก | |
| Workspace | เวิร์กสเปซ | |
| Workflow | เวิร์กโฟลว์ | คนละความหมายกับ Lakeflow Jobs |
| Schema | สคีมา | |
| Catalog | แค็ตตาล็อก | |
| Table | ตาราง | |
| View | วิว | |
| Query | คิวรี | |
| Streaming | สตรีมมิ่ง | |
| Batch | แบทช์ / การประมวลผลแบบกลุ่ม | "แบทช์" สำหรับ batch job; "การประมวลผลแบบกลุ่ม" สำหรับอธิบายภาพรวม |
| Job | งาน (Job) | ใส่ภาษาอังกฤษในวงเล็บครั้งแรกในแต่ละไฟล์ |
| Task | งานย่อย (task) | |
| Trigger | ทริกเกอร์ | |
| Schedule | ตารางเวลา | |
| Partition | พาร์ทิชัน | |
| Bucket | บัคเก็ต | |
| Lazy evaluation | การประมวลผลแบบ lazy / lazy evaluation | เก็บภาษาอังกฤษไว้ในวงเล็บ |
| Lineage | lineage / สาย lineage | คำนี้ไม่มีคำแปลไทยที่ดี เก็บภาษาอังกฤษ |
| Governance | governance / การกำกับดูแลข้อมูล | บริบทกว้างใช้ภาษาไทย; บริบทเฉพาะ Databricks UC ใช้คำว่า "data governance" |
| ETL / ELT | ETL / ELT | คงตัวย่อภาษาอังกฤษ |
| CDC (Change Data Capture) | CDC | คงตัวย่อ |
| SCD (Slowly Changing Dimension) | SCD | คงตัวย่อ |
| Idempotent | idempotent | คงภาษาอังกฤษ |
| Exactly-once | exactly-once | คงภาษาอังกฤษ |
| At-least-once | at-least-once | คงภาษาอังกฤษ |
| Watermark | watermark | คงภาษาอังกฤษ |
| Skew | data skew / การกระจายข้อมูลไม่สมดุล | |
| Shuffle | shuffle | คงภาษาอังกฤษ |
| Broadcast join | broadcast join | คงภาษาอังกฤษ |
| Spill | spill (การเขียนลงดิสก์) | คงภาษาอังกฤษ |

## คำศัพท์ ML / GenAI

| ภาษาอังกฤษ | คำแปลภาษาไทยมาตรฐาน | หมายเหตุ |
| :--- | :--- | :--- |
| Model | โมเดล | |
| Training | การเทรน / การฝึก | "การเทรน" เป็นที่นิยมกว่าในวงการ |
| Inference | inference / การ infer | คงภาษาอังกฤษ |
| Endpoint | endpoint | คงภาษาอังกฤษ |
| Embedding | embedding | คงภาษาอังกฤษ |
| Feature | feature / ฟีเจอร์ | "ฟีเจอร์" ในบริบท ML; "feature" ในบริบทผลิตภัณฑ์ |
| Experiment | experiment / การทดลอง | "experiment" สำหรับ MLflow Experiment; "การทดลอง" สำหรับบริบททั่วไป |
| Run | run | คงภาษาอังกฤษ (MLflow Run) |
| Registry | registry | คงภาษาอังกฤษ |
| Alias | alias | คงภาษาอังกฤษ (ใช้กับ UC Model Registry) |
| Stage | stage | คงภาษาอังกฤษ (deprecated, อ้างถึงระบบเก่า) |
| Champion / Challenger | Champion / Challenger | คงภาษาอังกฤษ |
| Drift detection | drift detection / การตรวจจับ drift | |
| Vector store | vector store | คงภาษาอังกฤษ |
| RAG (Retrieval-Augmented Generation) | RAG | คงตัวย่อ |
| Agent | agent / เอเจนต์ | คงภาษาอังกฤษในบริบทเฉพาะ Mosaic AI Agent Framework |
| Prompt | prompt | คงภาษาอังกฤษ |
| Token | โทเค็น | |

## คำศัพท์ทั่วไป (UI / workflow)

| ภาษาอังกฤษ | คำแปลภาษาไทยมาตรฐาน |
| :--- | :--- |
| Click | คลิก |
| Configure | ตั้งค่า / กำหนดค่า |
| Permission | สิทธิ์ / permission |
| Role | บทบาท / role |
| User | ผู้ใช้ |
| Admin | แอดมิน |
| Workspace admin | แอดมินของเวิร์กสเปซ |
| Account admin | แอดมินของ Account |
| Service principal | service principal |
| Group | กลุ่ม / group |
| Grant | grant (ให้สิทธิ์) |
| Revoke | revoke (ถอนสิทธิ์) |

## วลีที่พบบ่อยในเนื้อหา

| ภาษาอังกฤษ | คำแปลภาษาไทยมาตรฐาน |
| :--- | :--- |
| Use Cases | กรณีการใช้งาน |
| Common Issues & Errors | ปัญหาและข้อผิดพลาดที่พบบ่อย |
| Best Practices | แนวปฏิบัติที่ดี |
| Exam Tips | เคล็ดลับสอบ |
| Key Takeaways | สิ่งสำคัญที่ควรจำ |
| Related Topics | หัวข้อที่เกี่ยวข้อง |
| Official Documentation | เอกสารทางการ |
| Overview | ภาพรวม |
| Prerequisites | ความรู้พื้นฐาน / สิ่งที่ต้องรู้ก่อน |
| Hands-on | ลงมือทำ |

## หลักการเขียนภาษาไทยในไฟล์ technical

- ใช้ภาษาทางการ ไม่ใช่ภาษาพูด
- หลีกเลี่ยงคำสุภาพยืดยาด — เนื้อหาเป็นแนว reference ไม่ใช่บทความ
- ใส่ space ระหว่างภาษาไทยกับภาษาอังกฤษเสมอ: `ใช้ Delta Lake สำหรับ ACID transactions` (ไม่ใช่ `ใช้Delta Lakeสำหรับ`)
- เครื่องหมาย `%` ตามด้วย non-breaking space (ตามนโยบายของ repo): `24 %` ไม่ใช่ `24%`
- ใช้คำลงท้าย `ครับ/ค่ะ` เฉพาะในส่วนที่เป็น tone บุคคลที่ 1 (เช่น introduction ของ topic file); ส่วนที่เป็น factual reference ไม่ต้องใส่
- หลีกเลี่ยง "เรา" / "พวกเรา" ในเนื้อหาแบบ reference — ใช้รูป passive หรือ "ผู้อ่าน" / "ผู้ใช้งาน" แทน

## เพิ่มคำศัพท์ใหม่

ถ้าคุณเจอคำที่ยังไม่อยู่ใน glossary ระหว่างการแปล:

1. เพิ่มเข้าไปในตารางที่เหมาะสมใน PR เดียวกับการแปล
2. ระบุเหตุผลของคำแปลใน commit message (เช่น "เพิ่ม backfill → backfill (เก็บภาษาอังกฤษเพราะไม่มีคำไทยที่กระชับ)")
3. ถ้าเป็นคำที่อาจถกเถียงได้ ให้ Open PR แยกสำหรับ glossary โดยเฉพาะ เพื่อให้รีวิวง่ายขึ้น

---

**[← กลับไปหน้าหลักภาษาไทย](./README.md)** | **[Translation policy →](../../TRANSLATING.md)**

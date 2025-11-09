# البيلسان أونلاين – Starter

منصة متكاملة (Frontend + Backend) لمتجر الألبسة الشرعية النسائي **البيلسان أونلاين** مع واجهة عامة باللغة العربية وواجهة إدارة ثنائية اللغة.

## المكونات

- **Frontend**: React + React Router + TailwindCSS (RTL) + React Hook Form + i18next
- **Backend**: Node.js + Express + MongoDB (Mongoose) + Cloudinary
- **Deploy**: Netlify (واجهة) + Render (API) + MongoDB Atlas + Cloudinary

## البدء السريع

```bash
cd project/backend
npm install
cp .env.example .env
# عدل متغيرات البيئة
npm run dev

cd ../frontend
npm install
cp .env.example .env
# عدل عنوان الـ API
npm run dev
```

## ملامح الواجهة العامة

- تصميم عربي RTL مع ألوان بنفسجية ووردية ولمسة زهرية ناعمة.
- صفحات: الرئيسية، المتجر، تفاصيل المنتج، عن البيلسان، تواصل، خدمة التوصيل، الحجز.
- دعم لغتين (عربي رئيسي + إنجليزي).
- نموذج توصيل ونموذج حجز يرسلان الطلبات للـ API.
- زر واتساب عائم للتواصل السريع.

## لوحة التحكم

- تسجيل دخول JWT وحماية الصفحات.
- إحصائيات سريعة (منتجات، طلبات توصيل، حجوزات).
- إدارة المنتجات مع رفع الصور لـ Cloudinary.
- إدارة الطلبات والحجوزات وتحديث الحالة والتواصل عبر واتساب.

## متغيرات البيئة

- راجع `backend/.env.example` و `frontend/.env.example`.

## المهام القادمة

- ربط MongoDB Atlas وRender وNetlify.
- تجهيز موارد الهوية البصرية (الشعار، الصور).
- إضافة حماية إضافية للـ /admin/setup بعد الإنشاء الأولي.


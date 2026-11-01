# 🎯 صيّاد الأسعار — Price Hunter Egypt

مقارنة أسعار 11 متجر مصري في تقرير واحد مرتب بأرخص عرض.

**المتاجر:** جوميا، نون، أمازون مصر، فونكس، دريم 2000، 2B، اتصال ستور، دبي فون، بي تك، ميامي سنترز، رنين.

## 🚀 التشغيل المحلي
```bash
npm install
npm start
# افتح http://localhost:3000
```

## 🌐 الرفع على GitHub
```bash
git init
git add .
git commit -m "final: Price Hunter Egypt ready for Render"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/price-hunter-egypt.git
git push -u origin main
```

## ☁️ الرفع على Render
1. ادخل على https://dashboard.render.com
2. New + → Web Service → Connect GitHub repo
3. الإعدادات:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** `Node`
   - **Env Vars:** `DEMO_MODE=false` (للـ live)، أو `true` للـ demo
4. Deploy → انسخ رابط الموقع.

### متغيرات البيئة
| Key | Value | الوصف |
|-----|-------|-------|
| `PORT` | `10000` (Render يحطها أوتوماتيك) | بورت السيرفر |
| `DEMO_MODE` | `false` / `true` | `true` يعرض 3 نتائج تجريبية + تحذير أصفر |

## 🖨️ الطباعة / PDF
زر **طباعة / PDF** يفتح نافذة الطباعة — اختر Save as PDF.

## 📁 الهيكل
```
price-hunter-egypt/
├── server.js          # Express + API /api/search
├── public/
│   ├── index.html     # الواجهة
│   ├── styles.css     # التصميم (dark theme مطابق للصور)
│   └── app.js         # المنطق + i18n + فلترة + نسخ
├── package.json
├── render.yaml
└── README.md
```

## 👨‍💻 المطور
Tarek Abozald — 2026 © All Rights Reserved

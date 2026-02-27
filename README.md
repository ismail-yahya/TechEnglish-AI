# TechEnglish AI

TechEnglish AI is a comprehensive full-stack application designed to help users master English vocabulary and reading comprehension through AI-generated stories tailored to their proficiency level and chosen domains.

## 🌟 الميزات الرئيسية (Features)

- **قصص مخصصة بالذكاء الاصطناعي**: إنشاء قصص تتناسب مع مستوى اللغة والمجال المفضل للمستخدم.
- **بناء المفردات (Vocabulary Builder)**: حفظ الكلمات الجديدة، مراجعتها، وإجراء اختبارات قصيرة.
- **تحديد مستوى تفاعلي**: اختبار قراءة ودردشة مع الشخصيات في القصة.
- **نظام النطق (Speech Recognition)**: التدريب على التحدث بمساعدة تقنية AssemblyAI.
- **نظام حسابات آمن**: تسجيل الدخول والمصادقة مدمج مع حماية JWT.

## 🛠️ التقنيات المستخدمة (Technologies)

### الواجهة الأمامية (Frontend)

- React 19 + Vite (TypeScript)
- Tailwind CSS v4 & Radix UI (shadcn)
- Zustand (لإدارة الحالة)
- Axios

### الواجهة الخلفية (Backend)

- Node.js & Express (TypeScript)
- Supabase (PostgreSQL)
- Google Gemini API & AssemblyAI
- JWT & Bcrypt (للأمان والمصادقة)

## 🚀 طريقة التشغيل محلياً (Running Locally)

### المتطلبات الأساسية

- تثبيت Node.js (الإصدار 18 فما فوق).
- توافر حساب في Supabase للحصول على رابط قاعدة البيانات.
- توافر مفتاح API لـ Google Gemini.

### خطوات التثبيت

1. **نسخ المشروع من GitHub**:

   ```bash
   git clone https://github.com/YourUsername/techenglish-ai.git
   cd techenglish-ai
   ```

2. **تثبيت الحزم البرمجية**:
   في مسار الخلفية (Server):

   ```bash
   cd server
   npm install
   ```

   في مسار الواجهة الأمامية (Client):

   ```bash
   cd ../client
   npm install
   ```

3. **إعداد متغيرات البيئة (Environment Variables)**:
   في مجلد `server`، قم بإنشاء ملف باسم `.env` والصق فيه الإعدادات التالية مستنداً لـ `server/.env.example`:

   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/techenglish?schema=public"
   JWT_SECRET="your-strong-jwt-secret-here"
   JWT_EXPIRES_IN="7d"
   GEMINI_API_KEY="your-google-gemini-api-key"
   PORT=5000
   NODE_ENV=development
   CLIENT_URL="http://localhost:5173"
   ```

4. **تشغيل المشروع**:
   افتح نافذتين للطرفية (Terminal).

   **الطرفية الأولى (الخلفية):**

   ```bash
   cd server
   npm run dev
   ```

   **الطرفية الثانية (الأمامية):**

   ```bash
   cd client
   npm run dev
   ```

   الآن يمكنك فتح المتصفح على `http://localhost:5173`.

## 🌍 طريقة النشر (Deployment)

المشروع مهيأ ليتم استضافته كواجهة أمامية منفصلة وواجهة خلفية منفصلة (Decoupled Server).

1. **الواجهة الأمامية**: يمكن نشر مجلد `client` بسهولة ومجاناً على منصات مثل **Vercel** أو **Netlify**.
   - أمر البناء: `npm run build`
   - مجلد الإخراج: `dist`
2. **الواجهة الخلفية**: يمكن نشر مجلد `server` على منصات تدعم Node.js مثل **Render** أو **Koyeb**. تذكر إضافة متغيرات البيئة في لوحة تحكم الاستضافة.
   - أمر البناء: `npm run build`
   - أمر التشغيل: `npm start`

## ⚖️ الترخيص (License)

هذا المشروع متاح تحت ترخيص [MIT License](LICENSE).

# راهنمای انتشار سایت

همه‌چیز داخل کد آماده است. این کارها بیرون از کد هستند و فقط از دست خودت برمی‌آیند، به همین ترتیب انجامشان بده.

## ۱. خرید دامنه

یک دامنه بخر (مثلاً `parsaalizadeh.com` یا `parsaalizadeh.dev`). اسم خودت در دامنه برای جست‌وجوی «Parsa Alizadeh» کمک می‌کند.

## ۲. انتشار روی Vercel

1. کد را در یک ریپازیتوری GitHub بگذار.
2. در [vercel.com](https://vercel.com) با GitHub وارد شو، ریپازیتوری را Import کن و Deploy بزن. تنظیمات پیش‌فرض Next.js درست است.
3. در Vercel → Project → Settings → Domains دامنه‌ات را اضافه کن و رکوردهای DNS را همان‌طور که Vercel می‌گوید در سایت فروشندهٔ دامنه ثبت کن.

## ۳. تنظیم متغیرها (مهم‌ترین قدم)

در Vercel → Project → Settings → Environment Variables این‌ها را اضافه کن (نمونه در فایل `.env.example` هست):

| متغیر | مقدار |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | آدرس کامل دامنه، مثلاً `https://parsaalizadeh.com` (بدون `/` در آخر) |
| `GOOGLE_SITE_VERIFICATION` | کد تأیید Search Console (قدم ۴) |
| `GMAIL_USER` و `GMAIL_APP_PASSWORD` | فرم تماس پیام را از Gmail خودت به Gmail خودت می‌فرستد (App Password، نه رمز اصلی) |

بعد از تنظیم، یک بار دوباره Deploy کن.

> بدون `NEXT_PUBLIC_SITE_URL`، آدرس‌های canonical، sitemap و داده‌های ساختاریافته به دامنهٔ اشتباه اشاره می‌کنند.

> بدون این دو متغیر هم فرم تماس کار می‌کند: برنامهٔ ایمیلِ خودِ بازدیدکننده با پیام آماده باز می‌شود.

## ۴. گوگل سرچ کنسول

1. به [search.google.com/search-console](https://search.google.com/search-console) برو و دامنه را اضافه کن.
2. روش **HTML tag** را انتخاب کن، فقط مقدار داخل `content="…"` را در `GOOGLE_SITE_VERIFICATION` بگذار، دوباره Deploy کن و Verify بزن.
3. در بخش Sitemaps آدرس `https://دامنه‌ات/sitemap.xml` را ثبت کن.
4. در URL Inspection، صفحهٔ اصلی و `/about` را وارد کن و Request Indexing بزن.

## ۵. لینک دادن از پروفایل‌ها به سایت

- **GitHub:** Settings → Public profile → Name را بگذار **Parsa Alizadeh** و آدرس سایت را در Website بنویس.
- **LinkedIn:** در Contact info آدرس سایت را اضافه کن.
- **Instagram:** آدرس سایت را در بیو بگذار.
- در همه‌جا یک بیوی یکسان بنویس؛ مثلاً: *Freelance software developer: web, mobile and AI*.

## ۶. بعد از انتشار

- **چک نهایی:** یک بار صفحه‌ها را با [Rich Results Test](https://search.google.com/test/rich-results) امتحان کن.
- **لینک از بیرون:** از مشتری‌هایت (EnterEdge، GameSector) بخواه در سایتشان به سایتت لینک بدهند.
- **انتشار مقاله‌ها:** مقاله‌ها را در LinkedIn یا dev.to هم منتشر کن، با لینک به نسخهٔ اصلی.
- **صبر:** ایندکس‌شدن معمولاً از چند روز تا چند هفته طول می‌کشد.

## هر وقت چیزی عوض شد

- **اطلاعات شخصی:** `content/site.ts`
- **درباره و تایم‌لاین:** `content/about.ts`
- **پروژه‌ها:** یک فایل `.mdx` در `content/work/`
- **مقاله‌ها:** یک فایل `.mdx` در `content/blog/` (با بخش Sources)
- **ابزارها:** `content/stack.ts` (اسم پروژه را در `usedIn` بنویس)
- **دسته‌های موضوعی:** `content/topics.ts`

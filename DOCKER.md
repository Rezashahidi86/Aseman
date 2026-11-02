# راهنمای اجرای Aseman با Docker

این راهنما برای اجرای کامل Aseman روی یک سیستم دیگر، با استفاده از Docker Compose نوشته شده است. لازم نیست Node.js یا MongoDB را جداگانه روی سیستم میزبان نصب کنید؛ سرویس‌های برنامه و دیتابیس در کانتینرهای مستقل اجرا می‌شوند.

> تمام دستورها را از پوشه اصلی مخزن، یعنی جایی که فایل `docker-compose.yml` قرار دارد، اجرا کنید. نمونه دستورهای این راهنما برای PowerShell ویندوز نوشته شده‌اند.

## ۱. فایل محیطی را آماده کنید

اگر هنوز فایل `.env` ندارید، از فایل نمونه یک کپی بسازید:

```powershell
Copy-Item .env.example .env
```

فایل `.env` را باز کنید و مقادیر زیر را تنظیم کنید. هیچ‌کدام از رمزها و کلیدهای واقعی خود را در GitHub، چت یا اختیار افراد دیگر قرار ندهید.

### متغیرهای ضروری

| متغیر | کاربرد |
|---|---|
| `JWT_SECRET` | کلید امضای توکن‌های ورود؛ حداقل ۳۲ کاراکتر تصادفی و غیرقابل حدس |
| `MONGO_ROOT_USERNAME` | نام کاربر مدیریتی MongoDB |
| `MONGO_ROOT_PASSWORD` | رمز کاربر مدیریتی MongoDB |
| `MONGO_APP_USERNAME` | نام کاربر محدودشده‌ای که Backend با آن به دیتابیس وصل می‌شود |
| `MONGO_APP_PASSWORD` | رمز کاربر برنامه |
| `MONGO_REPLICA_SET_KEY` | کلید محرمانه احراز هویت اعضای Replica Set |
| `ADMIN_NAME` | نام ادمین اولیه |
| `ADMIN_EMAIL` | ایمیل ادمین اولیه |
| `ADMIN_PASSWORD` | رمز عبور ادمین اولیه |

برای سه رمز MongoDB و کلید Replica Set، سه مقدار مستقل و تصادفی بسازید. در PowerShell می‌توانید برای هر مقدار این دستور را اجرا کنید:

```powershell
$bytes = New-Object byte[] 32
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($bytes)
$rng.Dispose()
([BitConverter]::ToString($bytes)).Replace('-', '').ToLowerInvariant()
```

این دستور را سه بار اجرا کنید و هر بار خروجی متفاوت را در یکی از این متغیرها قرار دهید: `MONGO_ROOT_PASSWORD`، `MONGO_APP_PASSWORD` و `MONGO_REPLICA_SET_KEY`.

برای `JWT_SECRET` نیز یک مقدار تصادفی مستقل و حداقل ۳۲ کاراکتری قرار دهید. رمز ادمین را قوی و منحصربه‌فرد انتخاب کنید.

### متغیرهای اختیاری و پورت‌ها

- `APP_HOST_PORT=8080`: پورت پنل روی سیستم میزبان.
- `MONGO_HOST_PORT=27018`: پورت اتصال محلی به MongoDB.
- `DOCKER_CORS_ORIGINS=http://localhost:8080,http://127.0.0.1:8080`: مبدأهای مجاز پنل.
- `JWT_EXPIRES_IN=7d`: مدت اعتبار توکن.
- `SMS_API_KEY` و `SMS_SENDER`: اطلاعات سرویس پیامک؛ در صورت استفاده از قابلیت پیامک باید مقادیر معتبر وارد شوند.

مقادیر پورت پیش‌فرض را فقط در صورت تداخل با برنامه دیگری تغییر دهید. اگر پورت‌ها را تغییر دادید، برای ورود به پنل از پورت جدید استفاده کنید.

در فایل نمونه ممکن است `NODE_ENV` و `DATABASE_URL` برای توسعه محلی تنظیم شده باشند. در سرویس Docker، Compose مقدار `NODE_ENV=production` و آدرس دیتابیس داخلی Docker را به Backend می‌دهد؛ بنابراین آدرس دیتابیس محلی ویندوز جایگزین اتصال Docker نمی‌شود.

## ۲. اعتبارسنجی تنظیمات و اجرای پروژه

ابتدا مطمئن شوید فایل `.env` کامل است. سپس از پوشه اصلی پروژه اجرا کنید:

```powershell
docker compose config --quiet
```

اگر دستور بدون خطا تمام شد، Imageها را بسازید و سرویس‌ها را اجرا کنید:

```powershell
docker compose up -d --build
```

وضعیت سرویس‌ها را بررسی کنید:

```powershell
docker compose ps -a
```

سرویس‌های اصلی باید در وضعیت `healthy` باشند:

- `mongodb`: دیتابیس MongoDB.
- `backend`: API پروژه.
- `frontend`: پنل کاربری که توسط Nginx ارائه می‌شود.

سرویس `mongodb-init` یک سرویس یک‌باره است؛ پس از اجرای موفق، وضعیت `Exited (0)` برای آن طبیعی است. این سرویس Replica Set را مقداردهی اولیه می‌کند.

پس از سالم شدن سرویس‌ها، پنل را باز کنید:

- http://localhost:8080

## ۳. ساخت ادمین اولیه در دیتابیس Docker

دیتابیس تازه خالی است و برای ورود به پنل باید ادمین اولیه ساخته شود. پروژه اسکریپت آماده زیر را دارد:

`backend/scripts/seedAdmin.js`

ابتدا مطمئن شوید MongoDB و Backend اجرا شده‌اند:

```powershell
docker compose ps
```

سپس دستور زیر را در PowerShell و از پوشه اصلی پروژه اجرا کنید. این دستور فقط سه متغیر ادمین را از فایل محلی `.env` می‌خواند و آن‌ها را فقط به کانتینر موقت اجرای Seed می‌دهد؛ این مقادیر به محیط دائمی سرویس Backend اضافه نمی‌شوند.

```powershell
$adminKeys = @('ADMIN_NAME', 'ADMIN_EMAIL', 'ADMIN_PASSWORD')

foreach ($key in $adminKeys) {
    [Environment]::SetEnvironmentVariable($key, $null, 'Process')
}

Get-Content .env | ForEach-Object {
    if ($_ -match '^(ADMIN_NAME|ADMIN_EMAIL|ADMIN_PASSWORD)=(.*)$') {
        $key = $matches[1]
        $value = $matches[2].Trim()

        if (($value.StartsWith('"') -and $value.EndsWith('"')) -or
            ($value.StartsWith("'") -and $value.EndsWith("'"))) {
            $value = $value.Substring(1, $value.Length - 2)
        }

        [Environment]::SetEnvironmentVariable($key, $value, 'Process')
    }
}

foreach ($key in $adminKeys) {
    if ([string]::IsNullOrWhiteSpace([Environment]::GetEnvironmentVariable($key, 'Process'))) {
        throw " مقدار $key در فایل .env تنظیم نشده است."
    }
}

docker compose run --rm --no-deps -e ADMIN_NAME -e ADMIN_EMAIL -e ADMIN_PASSWORD backend node backend/scripts/seedAdmin.js
```

در صورت موفقیت، پیام زیر نمایش داده می‌شود:

```text
Admin seed completed successfully
```

اکنون با ایمیل و رمز عبوری که در `.env` تنظیم کرده‌اید، از صفحه ورود پنل وارد شوید.

**نکات مهم ساخت ادمین:**

- این کار را برای دیتابیس تازه و فقط یک‌بار انجام دهید.
- از ایمیلی استفاده کنید که از قبل در دیتابیس به کاربر دیگری اختصاص داده نشده باشد.
- اسکریپت در صورت وجود همان ایمیل، رکورد موجود را به نقش ADMIN تغییر می‌دهد؛ پس آن را برای ایمیل یک فروشنده یا کاربر موجود اجرا نکنید.
- اجرای مجدد اسکریپت رمز عبور کاربر موجود را تغییر نمی‌دهد؛ رمز عبور فقط هنگام ایجاد رکورد جدید ذخیره می‌شود.
- پس از ساخت ادمین، برای ورود از همان ایمیل و رمز تعریف‌شده در `.env` استفاده کنید. فایل `.env` را با دیگران به اشتراک نگذارید.

## ۴. دسترسی‌ها و ارتباط سرویس‌ها

- آدرس پنل: `http://localhost:8080`
- Backend از طریق شبکه داخلی Docker در دسترس Frontend قرار می‌گیرد و پورت ۳۰۰۰ به‌صورت عمومی روی میزبان منتشر نشده است.
- MongoDB به‌طور پیش‌فرض فقط روی `127.0.0.1:27018` میزبان منتشر می‌شود؛ از اینترنت یا سایر دستگاه‌های شبکه قابل دسترسی نیست.
- Backend با کاربر جداگانه MongoDB و دسترسی `readWrite` به دیتابیس `aseman` متصل می‌شود؛ از حساب root برای اتصال برنامه استفاده نمی‌کند.

### اتصال اختیاری با MongoDB Compass

برای مشاهده دیتابیس Docker از Compass، از اتصال محلی زیر استفاده کنید و نام کاربری و رمز واقعی root را از فایل `.env` خودتان وارد کنید:

```text
mongodb://MONGO_ROOT_USERNAME:MONGO_ROOT_PASSWORD@127.0.0.1:27018/?authSource=admin&directConnection=true
```

گزینه `directConnection=true` لازم است، چون Replica Set نام داخلی `mongodb:27017` را به کانتینرها معرفی می‌کند و این نام از سیستم میزبان قابل resolve نیست.

## ۵. دستورهای روزمره

مشاهده وضعیت:

```powershell
docker compose ps
```

مشاهده لاگ همه سرویس‌ها:

```powershell
docker compose logs --tail 100
```

مشاهده لاگ یک سرویس:

```powershell
docker compose logs --tail 100 backend
docker compose logs --tail 100 frontend
docker compose logs --tail 100 mongodb
docker compose logs mongodb-init
```

دنبال کردن زنده لاگ Backend:

```powershell
docker compose logs -f backend
```

راه‌اندازی مجدد یک سرویس:

```powershell
docker compose restart backend
```

توقف سرویس‌ها بدون حذف کانتینرها و Volumeها:

```powershell
docker compose stop
```

اجرای مجدد سرویس‌های متوقف‌شده:

```powershell
docker compose start
```

اعمال تغییرات کد و ساخت دوباره Imageها:

```powershell
docker compose up -d --build
```

برای اعمال تغییرات فایل `.env` روی سرویس‌ها، کانتینرهای مربوطه باید دوباره ساخته شوند:

```powershell
docker compose up -d --force-recreate backend frontend
```

اگر متغیرهای MongoDB یا کلید Replica Set را تغییر می‌دهید، قبل از هر اقدامی درباره اثر آن بر دیتابیس موجود بررسی جداگانه انجام دهید؛ تغییر رمزها در فایل `.env` به‌تنهایی لزوماً اعتبارنامه ذخیره‌شده داخل دیتابیس را تغییر نمی‌دهد.

## ۶. اطلاعات دیتابیس و فایل‌های آپلودشده

اطلاعات پایدار در Named Volumeهای Docker نگهداری می‌شوند:

- `mongodb_data`: اطلاعات اصلی دیتابیس.
- `mongodb_config`: اطلاعات پیکربندی MongoDB.
- `uploads_data`: فایل‌های آپلودشده برنامه.

ساخت مجدد Image یا کانتینر با دستورهای معمول بالا، این Volumeها را حذف نمی‌کند. دیتابیس Docker مستقل از MongoDB نصب‌شده روی ویندوز یا سیستم میزبان است؛ هیچ اطلاعاتی از دیتابیس محلی به‌صورت خودکار وارد دیتابیس Docker نمی‌شود.

**هشدار مهم:** دستور زیر Volumeها، از جمله دیتابیس و فایل‌های آپلودشده را حذف می‌کند. آن را برای توقف، به‌روزرسانی یا پاک‌سازی معمول اجرا نکنید:

```powershell
docker compose down -v
```

اگر اطلاعات مهمی در برنامه ثبت شده است، پیش از هر عملیات نگهداری یا انتقال، از دیتابیس و Volume فایل‌های آپلودشده نسخه پشتیبان تهیه کنید. فایل پشتیبان را خارج از Volumeها و ترجیحاً در محل جداگانه نگهداری کنید.

## ۷. رفع خطاهای متداول

### سرویس‌ها به وضعیت healthy نمی‌رسند

لاگ سرویس مشکل‌دار را ببینید:

```powershell
docker compose ps -a
docker compose logs --tail 150 mongodb
docker compose logs --tail 150 mongodb-init
docker compose logs --tail 150 backend
docker compose logs --tail 150 frontend
```

### خطای متغیر محیطی یا Set variable

فایل `.env` را بررسی کنید. مقادیر ضروری باید وجود داشته باشند و مقدارهای نمونه مثل `replace-this` یا رمزهای خالی نباید برای اجرا باقی مانده باشند.

### پورت قبلاً در حال استفاده است

اگر پورت 8080 یا 27018 اشغال است، مقدار `APP_HOST_PORT` یا `MONGO_HOST_PORT` را در `.env` تغییر دهید و سرویس‌های مربوط را مجدداً ایجاد کنید.

### ورود ادمین انجام نمی‌شود

- مطمئن شوید اسکریپت Seed پیام موفقیت داده است.
- از همان ایمیل و رمز عبوری استفاده کنید که هنگام Seed در `.env` قرار داده‌اید.
- لاگ Backend را بررسی کنید:

```powershell
docker compose logs --tail 100 backend
```

### تغییرات کد در سایت دیده نمی‌شوند

فایل‌های روی میزبان لزوماً به‌صورت زنده داخل Imageهای Production جایگزین نمی‌شوند. پس از تغییر کد، Imageها را دوباره بسازید:

```powershell
docker compose up -d --build
```

## ۸. نکات امنیتی برای بررسی پروژه روی سیستم دیگر

- فایل `.env` واقعی را در GitHub قرار ندهید و برای بررسی‌کننده ارسال نکنید.
- فقط فایل `.env.example` را در مخزن نگه دارید؛ این فایل باید فاقد رمزها و کلیدهای واقعی باشد.
- هر شخص باید روی سیستم خودش یک `.env` مستقل با رمزها و کلیدهای خودش بسازد.
- دیتابیس Docker هر سیستم مستقل است و ادمین اولیه باید در همان دیتابیس ساخته شود.
- برای بررسی کد در GitHub، دسترسی Read کافی است؛ برای اجرای محلی پروژه نیازی به دسترسی به حساب GitHub شما یا فایل `.env` شما نیست.
- این Compose برای اجرای محلی و تست با تنظیمات Production برنامه آماده شده است؛ انتشار عمومی روی VPS به تنظیم دامنه، HTTPS، فایروال و مدیریت امن Secretها نیاز دارد.

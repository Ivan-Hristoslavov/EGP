# Google Calendar Integration Setup

Тази документация описва как да настроите Google Calendar интеграция за автоматично синхронизиране на bookings.

## 📋 Преглед

Google Calendar интеграцията позволява:
- ✅ Автоматично синхронизиране на потвърдени bookings с Google Calendar
- ✅ Създаване на calendar events с детайли за клиента
- ✅ Настройка на напомняния (24 часа и 30 минути преди)
- ✅ Добавяне на клиента като attendee
- ✅ Автоматично обновяване на access tokens

## 🚀 Настройка

### 1. Google Cloud Console Setup

1. **Отидете на [Google Cloud Console](https://console.cloud.google.com/)**

2. **Създайте нов проект или изберете съществуващ:**
   - Кликнете на dropdown менюто в горния ляв ъгъл
   - Изберете "New Project" или съществуващ проект

3. **Активирайте Google Calendar API:**
   - Отидете на "APIs & Services" > "Library"
   - Търсете "Google Calendar API"
   - Кликнете върху него и натиснете "Enable"

4. **Създайте OAuth 2.0 credentials:**
   - Отидете на "APIs & Services" > "Credentials"
   - Кликнете "Create Credentials" > "OAuth client ID"
   - Ако е първи път, ще трябва да конфигурирате OAuth consent screen:
     - Изберете "External" user type
     - Попълнете задължителните полета (App name, User support email, Developer contact)
     - Добавете scopes: `../auth/calendar` и `../auth/userinfo.email`
     - Добавете test users (вашия email)

5. **Конфигурирайте OAuth client:**
   - Application type: "Web application"
   - Name: "Plumbing Business Calendar"
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/google/callback` (за development)
     - `https://yourdomain.com/api/auth/google/callback` (за production)

6. **Копирайте credentials:**
   - Client ID
   - Client Secret

### 2. Environment Variables

Добавете следните променливи във вашия `.env.local` файл:

```env
# Google Calendar Integration
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### 3. Database Migration

Изпълнете миграцията за да добавите необходимите полета:

```bash
# Ако използвате Supabase CLI
supabase db push

# Или изпълнете SQL директно в Supabase Dashboard:
ALTER TABLE bookings 
ADD COLUMN google_calendar_event_id TEXT DEFAULT NULL;

CREATE INDEX idx_bookings_google_calendar_event_id ON bookings(google_calendar_event_id);
```

## 🔧 Използване

### 1. Свързване с Google Calendar

1. Отидете на Admin Settings > Connections
2. Кликнете "Connect Google Calendar"
3. Влезте с вашия Google акаунт
4. Разрешете достъп до Calendar и email
5. Ще бъдете пренасочени обратно към settings

### 2. Синхронизиране на Bookings

1. В Connections таба кликнете "Sync Bookings"
2. Всички потвърдени bookings без calendar events ще бъдат синхронизирани
3. Calendar events ще съдържат:
   - Title: "Service Type - Customer Name"
   - Description: Пълни детайли за booking-а
   - Duration: 2 часа (може да се промени)
   - Attendees: Клиентът
   - Reminders: 24h и 30min преди

### 3. Автоматично Синхронизиране

За автоматично синхронизиране на нови bookings, можете да:

1. **Добавите webhook в booking creation процеса**
2. **Настроите cron job** за периодично синхронизиране
3. **Използвате auto-sync настройката** в Connections таба

## 🔍 Troubleshooting

### Често Срещани Проблеми

**1. "Configuration Error"**
- Проверете дали GOOGLE_CLIENT_ID е правилно настроен
- Уверете се, че redirect URI е добавен в Google Cloud Console

**2. "Token exchange failed"**
- Проверете GOOGLE_CLIENT_SECRET
- Уверете се, че OAuth consent screen е правилно конфигуриран

**3. "Calendar API quota exceeded"**
- Google Calendar API има лимити за заявки
- Ограничете честотата на синхронизиране

**4. "Failed to create calendar event"**
- Проверете дали потребителят има права за създаване на events
- Уверете се, че calendar ID е правилен

### Logs и Debugging

Проверете browser console и server logs за подробности за грешки:

```bash
# Next.js development logs
npm run dev

# Проверете Network tab в browser dev tools
# Проверете Console за JavaScript грешки
```

## 🔒 Сигурност

### Best Practices

1. **Никога не споделяйте Client Secret публично**
2. **Използвайте HTTPS в production**
3. **Ограничете OAuth scopes до минимално необходимите**
4. **Редовно обновявайте credentials**
5. **Мониторирайте API usage**

### Token Management

- Access tokens се обновяват автоматично
- Refresh tokens се съхраняват криптирано в базата данни
- Tokens се валидират преди всяка заявка

## 📊 Monitoring

### Metrics за Наблюдение

- Брой синхронизирани bookings
- API errors и rate limits
- Token refresh frequency
- Sync success rate

### Logging

Системата логва:
- Успешни синхронизации
- API грешки
- Token refresh операции
- Calendar event creation/updates

## 🆘 Support

Ако имате проблеми:

1. Проверете тази документация
2. Прегледайте logs за грешки
3. Проверете Google Cloud Console за API quotas
4. Валидирайте OAuth configuration

## 📚 Полезни Ресурси

- [Google Calendar API Documentation](https://developers.google.com/calendar/api)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Supabase Documentation](https://supabase.com/docs) 
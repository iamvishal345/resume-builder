# Optional Google Drive backup

Cavren never requires Drive. Local `.cavren.json` backup always works offline.

Drive backup uses **browser OAuth** against *your* Google account and writes one backup file to *your* Drive. Tokens stay in this browser. There is no Cavren sync server.

## 1. Create an OAuth client

1. Open [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials.
2. Create an **OAuth 2.0 Client ID** of type **Web application**.
3. Authorized JavaScript origins: your site origin, e.g. `https://your-domain.example` and `http://localhost:4321` for local dev.
4. Enable the **Google Drive API** for the project.
5. Copy the **Client ID** (looks like `….apps.googleusercontent.com`).

Scopes used: `drive.file` (files the app creates/opens only).

## 2. Configure Cavren

**Per browser (any deploy):**  
Dashboard → Data & privacy → paste the Client ID → Save.

**Build-time default (optional):**

```bash
# .env
PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

Users can still override or clear the ID in Data & privacy.

## 3. Use it

- **Backup to Drive** — uploads/replaces the Cavren backup file in Drive.
- **Restore from Drive** — downloads that file and merges or replaces local resumes (same modes as local pack restore).

If you are offline or the Client ID is missing, buttons explain the failure and point you back to local Download backup.

## Privacy note

Update your privacy page if you change scopes or storage. Default product copy: Drive is optional; tokens and files stay under the user’s Google account.

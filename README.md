![Audit Only](https://img.shields.io/badge/License-Audit--only-red)
![Reuse Forbidden](https://img.shields.io/badge/Reuse-forbidden-lightgrey)

# 🔍 UI Builder Dock – Audit-only Release

🛠️ [Available on Chrome Web Store](https://chromewebstore.google.com/detail/ui-builder-dock-for-servi/feekcnlbhmghaaoidhoiobpljgckeoap)

This browser extension was built to enhance the developer experience within ServiceNow UI Builder by exposing internal configuration details that are normally hidden.

This project is **not licensed for reuse, redistribution, or modification**.  

The code is shared strictly for:

- Reviewing its behavior  
- Understanding its functionality  
- Verifying that it does not perform any malicious actions

If you're here to check **what the extension does** and **whether it's safe** – you're in the right place.

---

## ✅ What you *can* do

- Read the source code  
- Understand how it works  
- Use it for educational purposes in private, **non-distributed** environments

---

## ❌ What you *cannot* do

- Use the code in your own projects  
- Modify or republish it  
- Bundle or redistribute it (even in modified form)  
- Use it for commercial or production purposes

---

## ℹ️ Why publish at all?

Because trust matters.

This extension runs in your browser and interacts with ServiceNow instances.  
To build trust with the community, I believe in letting others verify **how it works** and confirm that it behaves safely.

If you're curious, cautious, or just nosy – you're welcome to explore.

---



## 🧪 Run & Verify Locally

If you'd like to inspect or test the extension locally, follow these steps:

### 1. Clone the repository

```bash
git clone https://github.com/janmoser87/ui-builder-dock-for-servicenow.git
cd ui-builder-dock-for-servicenow
```

### 2. Install dependencies

```bash
pnpm install
```

If you don’t have pnpm, install it via:

```bach
npm install -g pnpm
```

### 3. Run in development mode

```bash
pnpm dev
```

This will start a local development build and generate the extension in the build/chrome-mv3-dev folder.

You can load it in Chrome → Extensions → Load unpacked and point it to build/chrome-mv3-dev.

## 🔐 Verify installed extension integrity

To make sure that the extension installed in your browser matches exactly what's published on GitHub:

### 1. Build the production version

```bash
pnpm build
```

This will generate a chrome-mv3-prod folder that mimics the deployed version.

### 2. Locate the installed extension

On Windows, go to:

```sql
C:\Users\<your-username>\AppData\Local\Google\Chrome\User Data\Default\Extensions\<extension-id>
```

Each extension is stored in a folder named after its Chrome Extension ID.

##### To find the correct one:

* Open chrome://extensions/
* Find this extension and note its ID (you'll find it in the URL, e.g. hiccfhbdghdpbcepamfflfiiepeoolbm)

### 3. Compare files or calculate checksums

Use tools like CertUtil (Windows) or shasum (macOS/Linux) to generate a hash of key files. Compare that hash to the same file from your local build/chrome-mv3-prod folder.

💡 This allows you to independently verify that what runs in your browser truly matches this public source code.

---

## 👤 Author

Created by **Jan Moser**

- 📝 [My UI Builder Corner](https://myuibcorner.com) – My personal blog with tips, tricks, and thoughts on UI Builder  
- 💼 [LinkedIn](https://www.linkedin.com/in/janmoser/) – Occasionally sharing my day-to-day experience with ServiceNow  
- ☕ [Buy Me a Coffee](https://www.buymeacoffee.com/janmoser) – Like the extension? Support me with a coffee!

This is a [Plasmo extension](https://docs.plasmo.com/).

---

## 📜 License

See [LICENSE](./LICENSE) for full details.  
All rights reserved. No usage rights are granted beyond personal code review.

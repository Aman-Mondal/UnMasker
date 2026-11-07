# UnMasker – Chrome Extension (Manifest V3)

A lightweight browser companion that scans the active tab in real-time with one click.

---

## 🚀 How to Install in Google Chrome / Brave / Edge

1. Open your browser and navigate to:
   ```text
   chrome://extensions
   ```
2. Enable **Developer mode** using the toggle switch in the top-right corner.
3. Click the **Load unpacked** button in the top-left corner.
4. Select this directory:
   ```text
   C:\Users\suman\Downloads\UnMasker\extension
   ```
   *(Or `<project-root>\extension`)*
5. The **UnMasker** shield icon will appear in your browser's toolbar/extensions menu!

---

## ⚡ How to Use

1. Ensure the UnMasker backend is running:
   ```bash
   python app.py
   # Or run_unmasker.bat (http://127.0.0.1:5000)
   ```
2. Navigate to any website in your browser (e.g. `https://sbi-secure-login.com` or `https://python.org`).
3. Click the **UnMasker** extension icon in your browser toolbar.
4. Click **Scan This Page**.
5. The popup will query the UnMasker REST API (`http://127.0.0.1:5000/api/scan`) and display the live Digital Trust Score, risk level, SSL status, and key reasons!

# How to Set Up, Save, and Push to GitHub Using VS Code

---

## PART 1: First-Time Setup (Do This Once)

---

### Step 1: Download the Project

Download ALL the files from Claude. You need this folder structure on your computer:

```
markup-app/
  .gitignore
  index.html
  package.json
  vite.config.js
  src/
    main.jsx
    App.jsx        <-- this is the main markup-app file
```

Save this folder somewhere easy to find, for example:

- Windows: `C:\Users\YourName\Projects\markup-app`
- Mac: `/Users/YourName/Projects/markup-app`

---

### Step 2: Open the Folder in VS Code

1. Open VS Code
2. Go to **File** then **Open Folder**
3. Navigate to your `markup-app` folder and select it
4. Click **Select Folder** (Windows) or **Open** (Mac)

You should now see all the files in the left sidebar (Explorer panel).

---

### Step 3: Open the Terminal Inside VS Code

1. Go to **Terminal** then **New Terminal** (top menu bar)
   - Or press:  Ctrl + `  (backtick key, below Escape)
2. A terminal panel opens at the bottom of VS Code

---

### Step 4: Install Dependencies

Type this in the VS Code terminal and press Enter:

```bash
npm install
```

Wait for it to finish. You will see a new `node_modules` folder appear in the sidebar.

---

### Step 5: Test the App Locally

Type this in the terminal:

```bash
npm run dev
```

You will see output like:

```
  VITE v5.4.0  ready in 300 ms

  > Local:   http://localhost:5173/
```

Hold Ctrl and click the `http://localhost:5173/` link. The app opens in your browser.

Press **Ctrl + C** in the terminal to stop the server when done testing.

---

### Step 6: Create a GitHub Repository

1. Open your browser and go to **https://github.com/new**
2. Fill in:
   - Repository name: `markup-app`
   - Description: `Visual feedback and collaboration tool`
   - Select **Private**
   - Do NOT check any boxes under "Initialize this repository"
3. Click **Create repository**
4. You will see a page with setup instructions -- keep this page open, you need the URL

---

### Step 7: Connect VS Code to GitHub and Push

Go back to VS Code. In the terminal at the bottom, type these commands one by one, pressing Enter after each:

```bash
git init
```

```bash
git add .
```

```bash
git commit -m "Initial commit: MarkUp feedback tool"
```

Now connect to GitHub (replace YOUR_USERNAME with your actual GitHub username):

```bash
git remote add origin https://github.com/YOUR_USERNAME/markup-app.git
```

```bash
git branch -M main
```

```bash
git push -u origin main
```

If this is your first time, a GitHub login popup will appear. Sign in and authorize VS Code.

After it finishes, refresh your GitHub page in the browser. You will see all your files there.

---

### Step 8: Deploy to Vercel

1. Go to **https://vercel.com** and click **Sign Up** with GitHub
2. Click **Add New Project**
3. Find `markup-app` in the list and click **Import**
4. Leave all settings as default (Vite is auto-detected)
5. Click **Deploy**
6. Wait about 60 seconds
7. You get a live URL like `https://markup-app-yourusername.vercel.app`

Done. Your app is now live on the internet.

---

---

## PART 2: Updating the App (Do This Every Time)

---

### When You Get a New File from Claude:

**Step 1:** Download the new `markup-app.jsx` file from Claude

**Step 2:** Rename it to `App.jsx`

**Step 3:** Replace the file in your project:
- In your file explorer (Finder on Mac, File Explorer on Windows)
- Go to `markup-app/src/`
- Delete the old `App.jsx`
- Paste the new `App.jsx` here

**Step 4:** Open VS Code (if not already open). You will see the file changed in the sidebar -- it shows an **M** (modified) next to `App.jsx`.

**Step 5:** Push to GitHub using the VS Code sidebar:

> **Option A: Using the Source Control Panel (Easiest)**
>
> 1. Click the **Source Control** icon in the left sidebar
>    (it looks like a branch/fork icon, third icon from top)
>
> 2. You will see `App.jsx` listed under "Changes"
>
> 3. Click the **+** button next to `App.jsx` to stage it
>    (or click the **+** next to "Changes" to stage everything)
>
> 4. Type a message in the text box at the top, for example:
>    `Updated app with new features`
>
> 5. Click the **Commit** button (checkmark icon)
>
> 6. Click **Sync Changes** (or the cloud upload icon)
>
> Done. Vercel automatically picks up the change and redeploys
> within 30-60 seconds.

> **Option B: Using the Terminal**
>
> Open the terminal in VS Code (Ctrl + `) and type:
>
> ```bash
> git add .
> git commit -m "Updated app with new features"
> git push
> ```

---

---

## PART 3: Quick Shortcut for Future Updates

---

Once everything is set up, the entire update process is just:

1. Download new file from Claude
2. Save it as `markup-app/src/App.jsx` (replace old file)
3. In VS Code terminal:

```bash
git add . && git commit -m "Update" && git push
```

4. Wait 60 seconds -- your live site is updated

---

---

## PART 4: VS Code Extensions That Help

---

Open VS Code and press **Ctrl + Shift + X** (Extensions panel). Search for and install these:

1. **GitHub Pull Requests** -- by GitHub
   Makes it easy to manage GitHub from inside VS Code

2. **GitLens** -- by GitKraken
   Shows git history, who changed what, and when

3. **ES7+ React Snippets** -- by dsznajder
   Helpful shortcuts for React development

---

---

## Troubleshooting

---

**"npm: command not found"**
Download and install Node.js from https://nodejs.org
Close and reopen VS Code after installing.

**"git: command not found"**
Download and install Git from https://git-scm.com/downloads
Close and reopen VS Code after installing.

**GitHub asks for username/password in terminal**
Run this once to save your credentials:
```bash
git config --global credential.helper store
```
Then push again. It will ask once and remember.

**"Failed to push" error**
Usually means the remote is not set. Run:
```bash
git remote -v
```
If empty, add it:
```bash
git remote add origin https://github.com/YOUR_USERNAME/markup-app.git
```

**File not showing in Source Control panel**
Make sure you opened the correct folder in VS Code.
Go to File then Open Folder and select the `markup-app` folder (not a parent folder).

**"Port 5173 is already in use"**
Another dev server is running. Close other terminals or run:
```bash
npx kill-port 5173
```
Then run `npm run dev` again.

**Changes not showing on live site**
1. Check Vercel dashboard for build errors
2. Make sure you ran `git push` (not just `git commit`)
3. Hard refresh your browser: Ctrl + Shift + R

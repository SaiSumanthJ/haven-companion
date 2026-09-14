# Haven

A private AI companion that runs on **your** computer. 18+ only.

This is software, not a person, and not therapy. Talk stays on this device. Haven does not put a copy of your chats on someone else’s server.

There is no phone app and no “download an APK.” You install two free programs, download one local model that **fits your RAM**, then open Haven in a browser on the same computer.

---

## What you need

| You need | Why | Get it |
|---|---|---|
| A computer (Windows, macOS, or Linux) with **at least 8 GB of RAM** | The companion model lives in memory | — |
| **Node.js 20 or newer** (LTS) | Starts the Haven website on this computer | [https://nodejs.org/](https://nodejs.org/) |
| **Ollama** | Runs the local model | [https://ollama.com/download](https://ollama.com/download) |
| One chat model from Ollama | The companion’s voice | Haven will name the right one for *your* RAM |
| A modern browser | Chrome, Edge, Firefox, or Safari | Already on the computer |
| Disk space for the model | Same size as the download (about 1–28 GB) | Free space on the drive |

**8 GB RAM** works only with a small model, and other apps should be closed. **16 GB** is the comfortable laptop size. **32 GB** or **64 GB** can run a much stronger companion.

Haven will **not** start a model that is too large for this computer. That is deliberate. A model that does not fit will freeze the machine. If nothing fitting is installed, the site still opens in demo mode so your words are saved; replies are placeholders until you install a fitting model.

---

## 1. Install Node.js

1. Open [https://nodejs.org/](https://nodejs.org/).
2. Download the **LTS** installer for your system (the one they mark as recommended).
3. Run the installer. Keep the default options. On Windows, leave “Add to PATH” checked.
4. **Close every old terminal window.** Open a new one.
5. Check that it worked:

```bash
node -v
```

You should see `v20` or higher (for example `v22.11.0`). If the command is not found, Node is not on PATH: install again, then open a **new** terminal.

---

## 2. Install Ollama and leave it open

1. Open [https://ollama.com/download](https://ollama.com/download).
2. Download for **macOS**, **Windows**, or **Linux**.
3. Install it.
4. **Start the Ollama app** and leave it running in the background.
   - macOS: the llama icon stays in the menu bar.
   - Windows: the llama icon stays in the system tray.
   - Linux: after install, Ollama usually runs as a service. If `ollama list` fails, run `ollama serve` and leave that window open.

Check:

```bash
ollama -v
```

If that fails, Ollama is not installed or not on PATH. Install again from the link above, then open a new terminal.

---

## 3. Get Haven onto this computer

**Option A — Git** (if you already use it):

```bash
git clone https://github.com/SaiSumanthJ/haven-companion.git
cd haven-companion
```

**Option B — ZIP** (no Git needed):

1. Open the GitHub page for this project.
2. Click the green **Code** button.
3. Click **Download ZIP**.
4. Unzip the file (double-click on Mac; right-click → Extract All on Windows).
5. Open a terminal **inside the unzipped folder** (the folder that contains `package.json`).

How to open a terminal in the folder:

- **macOS:** open Terminal, type `cd ` (with a space), drag the folder onto the window, press Enter.
- **Windows:** in File Explorer open the folder, click the address bar, type `cmd`, press Enter.
- **Linux:** right-click the folder → Open in Terminal.

---

## 4. Install Haven’s own files

In that same terminal:

```bash
npm install
```

Wait until it finishes. This does **not** download the companion brain yet. It only installs the website.

If `npm` is not found, go back to step 1 and open a **new** terminal after installing Node.

---

## 5. Let Haven read this computer and name a model

Still in that folder:

```bash
npm run setup
```

Read the whole printout. It will:

1. Measure RAM on **this** computer.
2. Name one recommended model that fits, plus one or two smaller backups.
3. Give you a single `ollama pull …` command to copy.
4. Tell you if Ollama is open, and if a fitting model is already installed.

**Do not skip this.** Do not download a huge model “to be safe.” A 27B model on an 8 GB or 16 GB laptop will not run well and Haven will refuse it.

---

## 6. Download the model it named

Copy the exact command `npm run setup` printed. It looks like one of these:

```bash
ollama pull gemma3:1b
ollama pull llama3.2:3b
ollama pull gemma3:4b
ollama pull llama3.1:8b
ollama pull gemma3:12b
ollama pull gemma3:27b
ollama pull gemma4:26b
```

Only run **one**. The download is several gigabytes. Leave the window open until it says the pull is complete.

Typical fit (Haven also measures *your* RAM; trust `npm run setup` over this table if they differ):

| RAM on this computer | Use this first | Also fine | Do not pull |
|---|---|---|---|
| 8 GB | `llama3.2:3b` | `gemma3:1b` | Anything 4B and larger |
| 16 GB | `llama3.1:8b` | `gemma3:4b` | `gemma3:27b`, `gemma4:26b` |
| 24 GB | `gemma3:12b` | `llama3.1:8b` | `gemma4:26b` |
| 32 GB | `gemma3:27b` | `gemma3:12b` | `gemma4:26b` (too large) |
| 48–64 GB+ | `gemma4:26b` | `gemma3:27b` | — |

You need **free disk** at least as large as that file (about 2 GB for 3B, 5 GB for 8B, 17 GB for 27B, 28 GB for Gemma 4 26B).

When the pull finishes:

```bash
npm run setup
```

You should now see a line like `Haven will use: …`. If it still says Ollama is not running, open the Ollama app and try again.

Browse other models only if you want: [https://ollama.com/library](https://ollama.com/library). Haven ignores embedding-only models and ignores any chat model that does not fit.

---

## 7. Start Haven

Ollama must still be open.

```bash
npm run dev
```

Leave that terminal running. Open a browser to:

**http://127.0.0.1:3000**

That address is this computer only. Other people on the internet cannot open your Haven.

1. Confirm you are 18+.
2. Name the companion.
3. Optionally say how they should know you.
4. Talk.

The first real reply can take a minute while the model wakes. Voice and Call the first time also download Whisper and Kokoro into a `.haven` folder in this project (about 150 MB, once). Keep the computer on the network for that first download; after that, speech stays local.

To stop: press `Ctrl+C` in the terminal. Start again later with `npm run dev` (Ollama still open).

---

## If something is wrong

| What you see | What to do |
|---|---|
| `node` or `npm` is not found | Install Node LTS from [nodejs.org](https://nodejs.org/), then open a **new** terminal |
| `ollama` is not found | Install from [ollama.com/download](https://ollama.com/download), then open a new terminal |
| `npm run setup` says Ollama is not running | Open the Ollama app and leave it running |
| The page says **Demo replies only** | No fitting model is installed. Run `npm run setup`, `ollama pull` the named model, keep Ollama open, refresh the page |
| The site will not open | In the Haven folder run `npm run dev`. Use **http://127.0.0.1:3000**, not a random other port |
| The computer crawls after you pull a model | That model is too large. In a terminal: `ollama rm NAME`, then `npm run setup` and pull the smaller recommended one |
| First reply takes a long time | Normal on the first wake. Wait. Do not pull a bigger model to “speed it up” |
| Voice or Call fails the first time | Wait for the one-time Whisper/Kokoro download. Stay on this computer; do not close the terminal |
| Windows SmartScreen blocks Ollama or Node | More info → Run anyway. Those installers are from the official sites above |
| macOS says the app is from the internet | Open System Settings → Privacy & Security → Open Anyway |

You do **not** need an API key. You do **not** need to pay a model host. Optional cloud keys are for a later choice and many hosted models refuse adult chat.

---

## What stays on this computer

- The Ollama model
- Whisper and Kokoro (after the first Voice/Call)
- Saved facts and rooms (in this browser)
- Files you attach

Export and import memory from **Menu → This device** if you want a file copy.

---

## Safety already in the product

- Age gate before anything else
- Persistent “this is AI” language
- Adult chat can be on or off
- Child sexual content is refused
- Suicide-method talk is stopped; crisis numbers are shown
- Sexual impersonation of a real private person is refused

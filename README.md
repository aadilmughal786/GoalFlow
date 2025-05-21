# GoalFlow

🎯 **Unlock Your Potential with GoalFlow**

Welcome to **GoalFlow**, your personal companion for achieving what matters most. This modern, intuitive web application empowers you to define, track, and conquer your goals with clarity and ease. Designed for seamless use across all your devices, GoalFlow keeps your aspirations front and center, helping you build momentum and celebrate every stride.

> **A Note on Your Data:**  
> GoalFlow prioritizes your privacy and control. All your valuable goal data is securely stored directly within your browser's **IndexedDB**. This means your information remains exclusively on your device. To ensure your data is always safe and transferable, GoalFlow includes a robust **export feature**, allowing you to back up or move your goals whenever you need.  
> There is **no server-side component** for data persistence.

---

## ✨ Features at a Glance

| Feature                       | Description                                                        |
| ----------------------------- | ------------------------------------------------------------------ |
| **Effortless Goal Creation**  | Set goals with clear titles, detailed descriptions, and deadlines. |
| **Dynamic Progress Tracking** | Visual indicators to help track your journey and stay motivated.   |
| **Break Down & Conquer**      | Divide large goals into smaller milestones and sub-goals.          |
| **Smart Organization**        | Use categories and tags to neatly manage and find goals.           |
| **Adaptive Design**           | Fully responsive interface for desktop and mobile use.             |
| **Private Data Storage**      | All data saved locally using browser's IndexedDB.                  |
| **Reliable Data Export**      | One-click export to back up or migrate your data.                  |
| **Sleek UI**                  | Clean, modern interface built with Shadcn UI and Tailwind CSS.     |

---

## 🛠️ Built With Modern Web Technologies

| Technology               | Description                                                        |
| ------------------------ | ------------------------------------------------------------------ |
| **Next.js (App Router)** | Modern React framework for fast routing and optimized performance. |
| **React**                | JavaScript library for building user interfaces.                   |
| **TypeScript**           | Type-safe JavaScript superset enhancing developer experience.      |
| **Tailwind CSS**         | Utility-first CSS framework for rapid styling.                     |
| **Shadcn UI**            | Accessible UI components based on Radix UI & Tailwind CSS.         |
| **IndexedDB**            | Built-in browser database for persistent local storage.            |
| **Dexie.js** _(Planned)_ | Simple and elegant wrapper over IndexedDB for ease of use.         |

---

## 🚀 Getting Started

### Prerequisites

- Node.js (LTS version recommended)
- A package manager: `npm`, `yarn`, or `pnpm`

### Installation

```bash
git clone https://github.com/<your-username>/goal-flow.git
cd goal-flow
```

Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

Initialize Shadcn UI (if not already done):

```bash
npx shadcn-ui@latest init
```

> ✅ When prompted:
>
> - TypeScript: **Yes**
> - App Router: **Yes**
> - CSS Variables: **Yes**
> - Paths: accept defaults (e.g., `app/globals.css`, `@/components`, `@/lib/utils`)

---

### Running the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Now open [http://localhost:3000](http://localhost:3000) in your browser to view GoalFlow!

---

## 💡 How to Use GoalFlow

| Action                        | Description                                                 |
| ----------------------------- | ----------------------------------------------------------- |
| **Create New Goals**          | Use the interface to define your goals clearly and quickly. |
| **Track Progress**            | Update progress as you reach milestones.                    |
| **Organize & Review**         | Sort and review goals using categories and tags.            |
| **Export Your Data**          | Download your goals locally for backup or transfer.         |
| **(Coming Soon)** Import Data | Restore goals from previously exported files.               |

---

## 🤝 Contributing

We welcome contributions! Here's how:

```bash
# Fork the repository
# Create a feature branch
git checkout -b feature/YourFeatureName

# Make your changes and commit
git commit -m 'Add new feature'

# Push your branch
git push origin feature/YourFeatureName

# Open a Pull Request on GitHub
```

---

## 📄 License

This project is open-source and distributed under the **MIT License**.

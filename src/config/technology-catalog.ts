export type TechnologyCategory =
  | "AI / ML"
  | "Frontend"
  | "Backend"
  | "Database"
  | "DevOps / Cloud"
  | "Testing"
  | "Mobile"
  | "Design / UI"
  | "Blockchain / Web3"
  | "Tools"

export type TechnologyCatalogItem = {
  id: string
  name: string
  type: "technology"
  category: TechnologyCategory
  adminCategory: TechnologyCategory
  iconId: string
  aliases?: string[]
}

export const TECHNOLOGY_CATALOG: TechnologyCatalogItem[] = [
  // ─── AI / ML ───────────────────────────────────────────────────────────────
  { id: "python", name: "Python", type: "technology", category: "AI / ML", adminCategory: "AI / ML", iconId: "python" },
  { id: "pytorch", name: "PyTorch", type: "technology", category: "AI / ML", adminCategory: "AI / ML", iconId: "pytorch" },
  { id: "tensorflow", name: "TensorFlow", type: "technology", category: "AI / ML", adminCategory: "AI / ML", iconId: "tensorflow" },
  { id: "keras", name: "Keras", type: "technology", category: "AI / ML", adminCategory: "AI / ML", iconId: "keras" },
  { id: "scikitlearn", name: "Scikit-Learn", type: "technology", category: "AI / ML", adminCategory: "AI / ML", iconId: "scikitlearn" },
  { id: "opencv", name: "OpenCV", type: "technology", category: "AI / ML", adminCategory: "AI / ML", iconId: "opencv" },
  { id: "pandas", name: "Pandas", type: "technology", category: "AI / ML", adminCategory: "AI / ML", iconId: "pandas" },
  { id: "numpy", name: "NumPy", type: "technology", category: "AI / ML", adminCategory: "AI / ML", iconId: "numpy" },
  { id: "matplotlib", name: "Matplotlib", type: "technology", category: "AI / ML", adminCategory: "AI / ML", iconId: "plotly" },
  { id: "mlflow", name: "MLflow", type: "technology", category: "AI / ML", adminCategory: "AI / ML", iconId: "mlflow" },
  { id: "streamlit", name: "Streamlit", type: "technology", category: "AI / ML", adminCategory: "AI / ML", iconId: "streamlit" },
  { id: "huggingface", name: "Hugging Face", type: "technology", category: "AI / ML", adminCategory: "AI / ML", iconId: "huggingface" },
  { id: "langchain", name: "LangChain", type: "technology", category: "AI / ML", adminCategory: "AI / ML", iconId: "langchain" },
  { id: "openai", name: "OpenAI", type: "technology", category: "AI / ML", adminCategory: "AI / ML", iconId: "chatgpt", aliases: ["chatgpt"] },
  { id: "anthropic", name: "Anthropic", type: "technology", category: "AI / ML", adminCategory: "AI / ML", iconId: "claude", aliases: ["claude"] },
  { id: "google", name: "Google Gemini", type: "technology", category: "AI / ML", adminCategory: "AI / ML", iconId: "gemini", aliases: ["gemini"] },

  { id: "jupyter", name: "Jupyter", type: "technology", category: "AI / ML", adminCategory: "AI / ML", iconId: "jupyter" },
  { id: "gradio", name: "Gradio", type: "technology", category: "AI / ML", adminCategory: "AI / ML", iconId: "gradio" },

  // ─── Frontend ──────────────────────────────────────────────────────────────
  { id: "html5", name: "HTML5", type: "technology", category: "Frontend", adminCategory: "Frontend", iconId: "html5" },
  { id: "css3", name: "CSS3", type: "technology", category: "Frontend", adminCategory: "Frontend", iconId: "css" },
  { id: "javascript", name: "JavaScript", type: "technology", category: "Frontend", adminCategory: "Frontend", iconId: "js", aliases: ["js"] },
  { id: "typescript", name: "TypeScript", type: "technology", category: "Frontend", adminCategory: "Frontend", iconId: "typescript", aliases: ["ts"] },
  { id: "react", name: "React", type: "technology", category: "Frontend", adminCategory: "Frontend", iconId: "react" },
  { id: "nextdotjs", name: "Next.js", type: "technology", category: "Frontend", adminCategory: "Frontend", iconId: "nextjs2", aliases: ["next", "nextjs"] },
  { id: "vuedotjs", name: "Vue.js", type: "technology", category: "Frontend", adminCategory: "Frontend", iconId: "vuedotjs", aliases: ["vue"] },
  { id: "nuxtdotjs", name: "Nuxt", type: "technology", category: "Frontend", adminCategory: "Frontend", iconId: "nuxt" },
  { id: "svelte", name: "Svelte", type: "technology", category: "Frontend", adminCategory: "Frontend", iconId: "svelte" },
  { id: "astro", name: "Astro", type: "technology", category: "Frontend", adminCategory: "Frontend", iconId: "astro" },
  { id: "tailwindcss", name: "Tailwind CSS", type: "technology", category: "Frontend", adminCategory: "Frontend", iconId: "tailwindcss" },
  { id: "bootstrap", name: "Bootstrap", type: "technology", category: "Frontend", adminCategory: "Frontend", iconId: "bootstrap" },
  { id: "vite", name: "Vite", type: "technology", category: "Frontend", adminCategory: "Frontend", iconId: "vite" },
  { id: "redux", name: "Redux", type: "technology", category: "Frontend", adminCategory: "Frontend", iconId: "redux" },
  { id: "reactquery", name: "React Query", type: "technology", category: "Frontend", adminCategory: "Frontend", iconId: "reactquery" },

  // ─── Backend ───────────────────────────────────────────────────────────────
  { id: "nodedotjs", name: "Node.js", type: "technology", category: "Backend", adminCategory: "Backend", iconId: "nodejs", aliases: ["node"] },
  { id: "bun", name: "Bun", type: "technology", category: "Backend", adminCategory: "Backend", iconId: "bun" },
  { id: "deno", name: "Deno", type: "technology", category: "Backend", adminCategory: "Backend", iconId: "deno" },
  { id: "express", name: "Express", type: "technology", category: "Backend", adminCategory: "Backend", iconId: "express" },
  { id: "nestjs", name: "NestJS", type: "technology", category: "Backend", adminCategory: "Backend", iconId: "nestjs" },
  { id: "fastapi", name: "FastAPI", type: "technology", category: "Backend", adminCategory: "Backend", iconId: "fastapi" },
  { id: "django", name: "Django", type: "technology", category: "Backend", adminCategory: "Backend", iconId: "django" },
  { id: "flask", name: "Flask", type: "technology", category: "Backend", adminCategory: "Backend", iconId: "flask" },
  { id: "spring", name: "Spring", type: "technology", category: "Backend", adminCategory: "Backend", iconId: "spring" },
  { id: "laravel", name: "Laravel", type: "technology", category: "Backend", adminCategory: "Backend", iconId: "laravel" },
  { id: "go", name: "Go", type: "technology", category: "Backend", adminCategory: "Backend", iconId: "go", aliases: ["golang"] },
  { id: "rust", name: "Rust", type: "technology", category: "Backend", adminCategory: "Backend", iconId: "rust" },
  { id: "cplusplus", name: "C++", type: "technology", category: "Backend", adminCategory: "Backend", iconId: "cplusplus", aliases: ["cpp"] },
  { id: "csharp", name: "C#", type: "technology", category: "Backend", adminCategory: "Backend", iconId: "dotnet" },

  { id: "php", name: "PHP", type: "technology", category: "Backend", adminCategory: "Backend", iconId: "php" },

  // ─── Database ──────────────────────────────────────────────────────────────
  { id: "postgresql", name: "PostgreSQL", type: "technology", category: "Database", adminCategory: "Database", iconId: "postgresql", aliases: ["postgres"] },
  { id: "mysql", name: "MySQL", type: "technology", category: "Database", adminCategory: "Database", iconId: "mysql" },
  { id: "mariadb", name: "MariaDB", type: "technology", category: "Database", adminCategory: "Database", iconId: "mariadb" },
  { id: "sqlite", name: "SQLite", type: "technology", category: "Database", adminCategory: "Database", iconId: "sqlite" },
  { id: "mongodb", name: "MongoDB", type: "technology", category: "Database", adminCategory: "Database", iconId: "mongodb" },
  { id: "redis", name: "Redis", type: "technology", category: "Database", adminCategory: "Database", iconId: "redis" },
  { id: "supabase", name: "Supabase", type: "technology", category: "Database", adminCategory: "Database", iconId: "supabase" },
  { id: "firebase", name: "Firebase", type: "technology", category: "Database", adminCategory: "Database", iconId: "firebase" },
  { id: "elasticsearch", name: "Elasticsearch", type: "technology", category: "Database", adminCategory: "Database", iconId: "elasticsearch" },
  { id: "duckdb", name: "DuckDB", type: "technology", category: "Database", adminCategory: "Database", iconId: "duckdb" },
  { id: "apachespark", name: "Apache Spark", type: "technology", category: "Database", adminCategory: "Database", iconId: "apachespark", aliases: ["spark"] },
  { id: "apachekafka", name: "Apache Kafka", type: "technology", category: "Database", adminCategory: "Database", iconId: "apachekafka", aliases: ["kafka"] },

  // ─── DevOps / Cloud ────────────────────────────────────────────────────────
  { id: "docker", name: "Docker", type: "technology", category: "DevOps / Cloud", adminCategory: "DevOps / Cloud", iconId: "docker" },
  { id: "kubernetes", name: "Kubernetes", type: "technology", category: "DevOps / Cloud", adminCategory: "DevOps / Cloud", iconId: "kubernetes", aliases: ["k8s"] },
  { id: "github", name: "GitHub", type: "technology", category: "DevOps / Cloud", adminCategory: "DevOps / Cloud", iconId: "github" },
  { id: "githubactions", name: "GitHub Actions", type: "technology", category: "DevOps / Cloud", adminCategory: "DevOps / Cloud", iconId: "githubactions" },
  { id: "gitlab", name: "GitLab", type: "technology", category: "DevOps / Cloud", adminCategory: "DevOps / Cloud", iconId: "gitlab" },
  { id: "jenkins", name: "Jenkins", type: "technology", category: "DevOps / Cloud", adminCategory: "DevOps / Cloud", iconId: "jenkins" },
  { id: "prometheus", name: "Prometheus", type: "technology", category: "DevOps / Cloud", adminCategory: "DevOps / Cloud", iconId: "prometheus" },
  { id: "grafana", name: "Grafana", type: "technology", category: "DevOps / Cloud", adminCategory: "DevOps / Cloud", iconId: "grafana" },
  { id: "nginx", name: "Nginx", type: "technology", category: "DevOps / Cloud", adminCategory: "DevOps / Cloud", iconId: "nginx" },
  { id: "linux", name: "Linux", type: "technology", category: "DevOps / Cloud", adminCategory: "DevOps / Cloud", iconId: "linux" },

  { id: "vscode", name: "Visual Studio Code", type: "technology", category: "DevOps / Cloud", adminCategory: "DevOps / Cloud", iconId: "vscode", aliases: ["vscode"] },
  { id: "googlecloud", name: "Google Cloud", type: "technology", category: "DevOps / Cloud", adminCategory: "DevOps / Cloud", iconId: "googlecloud", aliases: ["gcp"] },
  { id: "microsoftazure", name: "Microsoft Azure", type: "technology", category: "DevOps / Cloud", adminCategory: "DevOps / Cloud", iconId: "microsoftazure", aliases: ["azure"] },
  { id: "vercel", name: "Vercel", type: "technology", category: "DevOps / Cloud", adminCategory: "DevOps / Cloud", iconId: "vercel" },
  { id: "cloudflare", name: "Cloudflare", type: "technology", category: "DevOps / Cloud", adminCategory: "DevOps / Cloud", iconId: "cloudflare" },
  { id: "terraform", name: "Terraform", type: "technology", category: "DevOps / Cloud", adminCategory: "DevOps / Cloud", iconId: "terraform" },

  // ─── Testing ───────────────────────────────────────────────────────────────

  { id: "cypress", name: "Cypress", type: "technology", category: "Testing", adminCategory: "Testing", iconId: "cypress" },
  { id: "jest", name: "Jest", type: "technology", category: "Testing", adminCategory: "Testing", iconId: "jest" },
  { id: "vitest", name: "Vitest", type: "technology", category: "Testing", adminCategory: "Testing", iconId: "vitest" },
  { id: "testinglibrary", name: "Testing Library", type: "technology", category: "Testing", adminCategory: "Testing", iconId: "testinglibrary" },
  { id: "pytest", name: "Pytest", type: "technology", category: "Testing", adminCategory: "Testing", iconId: "pytest" },
  { id: "selenium", name: "Selenium", type: "technology", category: "Testing", adminCategory: "Testing", iconId: "selenium" },

  // ─── Mobile ────────────────────────────────────────────────────────────────
  { id: "flutter", name: "Flutter", type: "technology", category: "Mobile", adminCategory: "Mobile", iconId: "flutter" },
  { id: "dart", name: "Dart", type: "technology", category: "Mobile", adminCategory: "Mobile", iconId: "dart" },
  { id: "android", name: "Android", type: "technology", category: "Mobile", adminCategory: "Mobile", iconId: "android" },
  { id: "kotlin", name: "Kotlin", type: "technology", category: "Mobile", adminCategory: "Mobile", iconId: "kotlin" },
  { id: "swift", name: "Swift", type: "technology", category: "Mobile", adminCategory: "Mobile", iconId: "swift" },
  { id: "ios", name: "iOS", type: "technology", category: "Mobile", adminCategory: "Mobile", iconId: "ios" },
  { id: "expo", name: "Expo", type: "technology", category: "Mobile", adminCategory: "Mobile", iconId: "expo" },

  // ─── Design / UI ───────────────────────────────────────────────────────────
  { id: "figma", name: "Figma", type: "technology", category: "Design / UI", adminCategory: "Design / UI", iconId: "figma" },

  { id: "blender", name: "Blender", type: "technology", category: "Design / UI", adminCategory: "Design / UI", iconId: "blender" },
  { id: "storybook", name: "Storybook", type: "technology", category: "Design / UI", adminCategory: "Design / UI", iconId: "storybook" },

  // ─── Blockchain / Web3 ─────────────────────────────────────────────────────
  { id: "solidity", name: "Solidity", type: "technology", category: "Blockchain / Web3", adminCategory: "Blockchain / Web3", iconId: "solidity" },
  { id: "ethereum", name: "Ethereum", type: "technology", category: "Blockchain / Web3", adminCategory: "Blockchain / Web3", iconId: "ethereum" },
  { id: "web3dotjs", name: "Web3.js", type: "technology", category: "Blockchain / Web3", adminCategory: "Blockchain / Web3", iconId: "web3dotjs" },

  // ─── Tools ─────────────────────────────────────────────────────────────────
  { id: "git", name: "Git", type: "technology", category: "Tools", adminCategory: "Tools", iconId: "git" },
  { id: "postman", name: "Postman", type: "technology", category: "Tools", adminCategory: "Tools", iconId: "postman" },
  { id: "neovim", name: "Neovim", type: "technology", category: "Tools", adminCategory: "Tools", iconId: "neovim" },
  { id: "vscodium", name: "VS Code", type: "technology", category: "Tools", adminCategory: "Tools", iconId: "vscode", aliases: ["vscode", "visual studio code"] },
  { id: "ubuntu", name: "Ubuntu", type: "technology", category: "Tools", adminCategory: "Tools", iconId: "ubuntu" },
]

export function normalizeTechName(name: string | undefined | null): string {
  if (!name) return ""
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .trim()
}

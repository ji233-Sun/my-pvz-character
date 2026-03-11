import FortuneFinder from "@/components/fortune-finder";
import { getCatalogStats } from "@/lib/pvz-data";

export default function Home() {
  const stats = getCatalogStats();

  return (
    <main className="min-h-screen px-5 py-8 text-foreground md:px-8 lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="overflow-hidden rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] shadow-[0_30px_80px_-40px_var(--shadow)] backdrop-blur">
          <div className="grid gap-8 px-6 py-8 md:px-10 md:py-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-stretch">
            <div className="flex flex-col gap-6">
              <div className="flex flex-wrap gap-3 text-sm font-medium text-[color:var(--line-strong)]">
                <span className="rounded-full border border-[var(--line)] bg-white/60 px-4 py-2">
                  官方图鉴同步
                </span>
                <span className="rounded-full border border-[var(--line)] bg-white/60 px-4 py-2">
                  植物 {stats.plantCount}
                </span>
                <span className="rounded-full border border-[var(--line)] bg-white/60 px-4 py-2">
                  僵尸 {stats.zombieCount}
                </span>
                <a
                  href="https://github.com/ji233-Sun/my-pvz-character"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-white/60 px-4 py-2 hover:-translate-y-0.5 hover:border-[var(--line-strong)] hover:bg-white/90"
                >
                  <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true">
                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
                  </svg>
                  GitHub
                </a>
              </div>

              <div className="space-y-4">
                <p className="font-display text-4xl leading-none text-[color:var(--line-strong)] md:text-5xl">
                  PVZ2 本命检测所
                </p>
                <h1 className="max-w-3xl text-2xl font-semibold leading-tight text-[#2d3d1e] md:text-4xl">
                  输入你的昵称，让 AI 从植物大战僵尸 2 全量图鉴里挑出最像你的那一位。
                </h1>
                <p className="max-w-2xl text-base leading-8 text-[#5d553d] md:text-lg">
                  数据直接来自官网图鉴页的真实网络请求，页面会根据你的选择在植物、僵尸或随机阵营里做匹配，并给出一段带点玩味但要讲得通的理由。
                </p>
              </div>
            </div>

            <FortuneFinder plantCount={stats.plantCount} zombieCount={stats.zombieCount} />
          </div>
        </section>
      </div>
    </main>
  );
}

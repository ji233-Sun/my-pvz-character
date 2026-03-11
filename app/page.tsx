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

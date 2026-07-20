export default function Loading() {
  return <div className="min-h-screen animate-pulse bg-canvas p-5 lg:pl-[280px] lg:pt-10"><div className="h-4 w-32 rounded bg-slate-200" /><div className="mt-5 h-12 max-w-xl rounded bg-slate-200" /><div className="mt-10 grid max-w-5xl grid-cols-2 gap-4 md:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-40 rounded-lg bg-slate-200" />)}</div><div className="mt-8 h-72 max-w-5xl rounded-lg bg-slate-200" /></div>;
}

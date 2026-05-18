const Welcome = () => {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.18),_transparent_38%),linear-gradient(135deg,_#0f172a_0%,_#172554_45%,_#0f766e_100%)] px-6 py-14 text-center shadow-2xl shadow-slate-900/20">
      <div className="max-w-5xl">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-cyan-100/80">
          Sistema de gestión
        </p>
        <h1 className="text-balance text-4xl font-black uppercase leading-none tracking-[0.18em] text-white drop-shadow-[0_10px_30px_rgba(15,23,42,0.45)] sm:text-6xl md:text-7xl lg:text-8xl">
          Bienvenidos al gestor academico
        </h1>
        <p className="mx-auto mt-6 max-w-3xl text-sm leading-7 text-slate-100/80 sm:text-base md:text-lg">
          Administra carreras, grupos, matrículas y evaluaciones desde un solo lugar.
        </p>
      </div>
    </div>
  );
};

export default Welcome;
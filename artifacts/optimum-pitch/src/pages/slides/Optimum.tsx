export default function Optimum() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-bg text-primary font-body px-[5vw] py-[5vh]">
      <header className="flex items-start justify-between">
        <div className="text-[1.5vw] font-extrabold">Optimum</div>
        <div className="text-right text-[1.5vw] leading-[1.8] text-muted font-['DM_Mono',monospace]">
          <p>Project: Optimum</p>
          <p>Format: Product pitch</p>
          <p>Length: Two minutes</p>
          <p>Audience: First-time applicants</p>
        </div>
      </header>
      <div className="absolute bottom-[15vh] left-[5vw] w-[90vw]">
        <div className="relative">
          <div aria-hidden="true" className="absolute left-[-2vw] top-[2vh] h-[5vh] w-[25vw] bg-primary/10" />
          <h1 className="relative text-[8vw] leading-none font-black tracking-[-0.04em]">Optimum</h1>
        </div>
        <div className="mt-[6vh] flex items-end justify-between gap-[4vw]">
          <p className="pitch-copy max-w-[57vw] text-[2vw] text-muted">Helping rural first-time job seekers understand, demonstrate and communicate their fit.</p>
          <div aria-hidden="true" className="w-[26vw] h-px bg-accent" />
        </div>
      </div>
    </div>
  );
}

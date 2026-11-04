export default function Problem() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-bg text-primary font-body px-[5vw] py-[5vh]">
      <header className="text-[1.5vw] font-extrabold">Optimum</header>
      <div className="grid grid-cols-[5fr_6fr] gap-[6vw] items-center h-[78vh]">
        <h1 className="pitch-heading text-[5.5vw]">“I keep applying. I never hear back.”</h1>
        <div className="pitch-copy text-[2.1vw] text-muted">
          <p className="border-t border-accent pt-[4vh] pb-[4vh]">A first-time applicant with limited access to career guidance</p>
          <p className="border-t border-accent py-[4vh]">Unsure what an employer needs—or which experiences demonstrate a match</p>
          <p className="border-t border-accent pt-[4vh]">Rejection without a clear next step</p>
        </div>
      </div>
    </div>
  );
}

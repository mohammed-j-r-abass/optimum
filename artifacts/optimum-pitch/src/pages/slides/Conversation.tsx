export default function Conversation() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-bg text-primary font-body px-[5vw] py-[5vh]">
      <header className="flex items-start justify-between">
        <h1 className="pitch-heading text-[4.2vw] max-w-[76vw]">Start with a conversation, not a CV.</h1>
        <span className="text-[1.5vw] font-extrabold">Optimum</span>
      </header>
      <div className="mt-[10vh] grid grid-cols-3 gap-[4vw]">
        <section>
          <span className="text-[7vw] font-extrabold text-accent leading-none">01</span>
          <p className="pitch-copy text-[2.05vw] text-muted mt-[4vh]"><strong className="text-primary">Understand the job:</strong> explain the employer’s needs and required skills</p>
        </section>
        <section>
          <span className="text-[7vw] font-extrabold text-accent leading-none">02</span>
          <p className="pitch-copy text-[2.05vw] text-muted mt-[4vh]"><strong className="text-primary">Discover evidence:</strong> ask about school, projects, work and community responsibilities</p>
        </section>
        <section>
          <span className="text-[7vw] font-extrabold text-accent leading-none">03</span>
          <p className="pitch-copy text-[2.05vw] text-muted mt-[4vh]"><strong className="text-primary">Assess fit:</strong> select relevant examples and explain what skills still need building</p>
        </section>
      </div>
    </div>
  );
}

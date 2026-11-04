export default function Alternatives() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-bg text-primary font-body px-[5vw] py-[5vh]">
      <header className="flex justify-between items-start">
        <h1 className="pitch-heading text-[4.2vw] max-w-[77vw]">A better-looking CV is not the whole answer.</h1>
        <span className="text-[1.5vw] font-extrabold">Optimum</span>
      </header>
      <div className="grid grid-cols-3 gap-[4vw] mt-[14vh]">
        <p className="pitch-copy text-[2.1vw] text-muted border-t-[0.3vh] border-primary pt-[4vh]"><strong className="text-primary">Templates</strong> help with presentation, but choosing relevant evidence remains difficult</p>
        <p className="pitch-copy text-[2.1vw] text-muted border-t-[0.3vh] border-primary pt-[4vh]"><strong className="text-primary">Upload-based tools</strong> can miss useful experience never included in the original CV</p>
        <p className="pitch-copy text-[2.1vw] text-muted border-t-[0.3vh] border-primary pt-[4vh]"><strong className="text-primary">Human coaching</strong> can be valuable, but costly or hard to access</p>
      </div>
    </div>
  );
}

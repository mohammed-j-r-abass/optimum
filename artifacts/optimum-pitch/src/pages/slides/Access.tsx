export default function Access() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-bg text-primary font-body px-[5vw] py-[5vh]">
      <header className="text-[1.5vw] font-extrabold">Optimum</header>
      <h1 className="pitch-heading text-[4.8vw] max-w-[88vw] mt-[6vh]">Career guidance should not depend on where you live.</h1>
      <div className="mt-[7vh] grid grid-cols-[5fr_6fr] gap-[6vw] text-[2.1vw] pitch-copy">
        <div className="text-muted">
          <p>No existing CV required</p>
          <p className="mt-[4vh]">Lightweight pages; voice-first when data is limited, video when useful</p>
          <p className="mt-[4vh]">Live AI still needs an internet connection</p>
        </div>
        <p className="font-bold border-t-[0.3vh] border-primary pt-[4vh] text-[3vw] leading-[1.3]">Optimum: your experience, matched to opportunity</p>
      </div>
    </div>
  );
}

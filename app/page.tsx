
import { Slack, Github } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#f8fafc] to-[#e0e7ef]">
      <div className="bg-white/80 rounded-2xl shadow-xl px-10 py-12 flex flex-col items-center gap-8 border border-gray-200 max-w-md w-full">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2 text-center drop-shadow-sm tracking-tight">Welcome to <span className="text-[#611f69]">Triviador!</span></h1>
        <p className="text-gray-600 text-center mb-4 text-base md:text-lg">Test your knowledge and challenge your friends.</p>
        <div className="flex flex-col gap-4 w-full">
          <button
            className="w-full h-12 px-6 py-2 rounded-lg bg-[#611f69] text-white font-semibold shadow hover:bg-[#4a154b] transition flex items-center gap-2 justify-center cursor-pointer text-base"
          >
            <Slack size={22} />
            Continue with Slack
          </button>
          <button
            className="w-full h-12 px-6 py-2 rounded-lg bg-white text-black border border-gray-300 font-semibold shadow hover:bg-gray-100 transition flex items-center gap-2 justify-center cursor-pointer text-base"
          >
            <span className="text-2xl font-bold">G</span>
            Continue with Google
          </button>
          <button
            className="w-full h-12 px-6 py-2 rounded-lg bg-black text-white font-semibold shadow hover:bg-gray-900 transition flex items-center gap-2 justify-center cursor-pointer text-base"
          >
            <Github size={22} />
            Continue with GitHub
          </button>
        </div>
      </div>
    </div>
  );
}

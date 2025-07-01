type ErrorProps = { error: string };

export default function Error({ error }: ErrorProps) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#f8fafc] to-[#e0e7ef]">
      <div className="bg-white/80 rounded-2xl shadow-xl px-10 py-12 flex flex-col items-center gap-8 border border-gray-200 max-w-md w-full">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2 text-center drop-shadow-sm tracking-tight">Error</h1>
        <p className="text-red-600 text-center mb-4 text-base md:text-lg">{error}</p>
      </div>
    </div>
  );
}
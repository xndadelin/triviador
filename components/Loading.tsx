export const Loading = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-white">
      <div className="relative flex items-center justify-center h-12 w-12 mb-6">
        <span className="absolute inline-block h-12 w-12 rounded-full border-4 border-gray-200"></span>
        <span className="inline-block h-12 w-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></span>
      </div>
      <span className="text-base text-gray-600 font-medium">Loading...</span>
    </div>
  );
}
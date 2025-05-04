export default function BillHeading() {
  return (
    <div className="bg-gradient-to-r from-gray-800 to-gray-900 py-8 px-6 w-full mx-auto rounded-xl shadow-2xl border border-white/10 relative overflow-hidden">
      {/* Subtle animated background effect */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute w-32 h-32 bg-cyan-500/30 rounded-full -top-16 -left-16 animate-pulse-slow"></div>
        <div className="absolute w-32 h-32 bg-blue-500/30 rounded-full -bottom-16 -right-16 animate-pulse-slow"></div>
      </div>

      {/* Main heading content */}
      <div className="relative z-10 space-y-2">
        <div className="flex items-center justify-center space-x-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent text-3xl font-bold text-blue-400 mb-2 flex items-center justify-center gap-2">
          <svg 
                  className="w-10 h-10 text-cyan-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
            Bill Generation
          </h1>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
        </div>

        {/* Subtle subtitle */}
        <p className="text-center text-sm text-gray-400 font-medium">
          Ukshati Technologies Private Limited
        </p>
      </div>

      {/* Decorative corner elements */}
      <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-purple-500/50"></div>
      <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-blue-500/50"></div>
    </div>
  );
}
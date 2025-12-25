export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">TradeArena</h1>
        <p className="text-xl text-gray-300 mb-8">New version coming soon</p>
        <a 
          href="/old" 
          className="inline-block px-6 py-3 bg-gradient-to-r from-[#00ff88] to-[#00d4ff] text-black font-semibold rounded-lg hover:shadow-lg hover:shadow-[#00ff88]/50 transition-all"
        >
          View Legacy Version
        </a>
      </div>
    </div>
  );
}

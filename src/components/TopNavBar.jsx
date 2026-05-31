export default function TopNavBar({ title, showSearch = false }) {
  return (
    <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-md border-b-2 border-dark flex justify-between items-center px-8 py-4">
      {/* Left: Search or Title */}
      <div className="flex items-center gap-4">
        {showSearch ? (
          <div className="relative text-dark hidden md:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 opacity-50 text-[20px]">search</span>
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="pl-10 pr-4 py-2 rounded-full border-2 border-dark bg-background/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary w-60 transition-all font-body text-sm"
            />
          </div>
        ) : (
          title && (
            <h2 className="font-headline font-bold text-xl text-dark">{title}</h2>
          )
        )}
      </div>

      {/* Right: Actions Removed */}
    </header>
  )
}

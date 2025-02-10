export function TableHeader() {
  return (
    <header className="flex w-full border-b p-2">
      <nav className="flex w-full justify-between">
        <span className="basis-1/6 text-center">Type</span>
        <span className="basis-1/4 text-center">Filename</span>
        <span className="basis-1/4 text-center">URL</span>
        <span className="basis-1/6 text-center">Action</span>
      </nav>
    </header>
  )
}

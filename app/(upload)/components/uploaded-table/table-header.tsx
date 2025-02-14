export function TableHeader() {
  return (
    <header className="flex w-full border-b p-2">
      <nav className="flex w-full justify-between @container">
        <div className="hidden text-center sm:block">Type</div>
        <div className="flex flex-col items-start @sm:w-full @sm:flex-row @sm:items-center @sm:justify-evenly">
          <div className="w-40 text-left @sm:text-center">Filename</div>
          <div className="w-40 text-left @sm:text-center">URL</div>
        </div>
        <div className="basis-1/6 text-center">Action</div>
      </nav>
    </header>
  )
}

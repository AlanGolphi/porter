import Logo from '@/app/assets/images/logo.png'
import { Button } from '@/components/ui/button'
import { CircleUser, Menu, Moon, Settings, Sun } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function GlobalNav() {
  return (
    <>
      {/* mobile navbar */}
      <header className="fixed left-4 top-4 z-50 w-[calc(100%-2rem)] min-w-72 rounded-2xl bg-card-mud px-4 py-2 md:hidden">
        <div className="flex w-full items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Image src={Logo} alt="Logo" width={48} height={48} className="h-12 w-12" />
            <span className="text-lg font-bold">porter</span>
          </Link>
          <Menu className="!size-6" />
        </div>
      </header>

      {/* desktop sidebar */}
      <header className="fixed left-4 top-4 z-50 hidden h-[calc(100dvh-2rem)] w-20 rounded-2xl bg-card-mud p-4 md:flex">
        <div className="flex h-full w-full flex-col items-center justify-between">
          <Link href="/" className="flex flex-col items-center space-y-2">
            <Image src={Logo} alt="Logo" width={48} height={48} className="h-12 w-12" />
            <span className="text-lg font-bold">porter</span>
          </Link>
          <nav className="flex flex-col items-center justify-end space-y-4">
            <Button
              size="icon"
              variant="outline"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white dark:bg-slate-950"
            >
              <Moon className="hidden !size-6 dark:block" />
              <Sun className="block !size-6 dark:hidden" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white dark:bg-slate-950"
            >
              <Settings className="!size-6" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white dark:bg-slate-950"
            >
              <CircleUser className="!size-6" />
            </Button>
          </nav>
        </div>
      </header>
    </>
  )
}

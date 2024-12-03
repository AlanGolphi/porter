import Logo from '@/app/assets/images/logo.png'
import { CircleUser, Moon, Settings, Sun } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function GlobalNav() {
  return (
    <header className="fixed left-4 top-4 z-50 hidden h-[calc(100dvh-2rem)] w-20 rounded-2xl bg-card-mud p-4 md:flex">
      <div className="flex h-full w-full flex-col items-center justify-between">
        <Link href="/" className="flex flex-col items-center space-y-2">
          <Image src={Logo} alt="Logo" width={48} height={48} className="h-12 w-12" />
          <span className="text-lg font-bold">porter</span>
        </Link>
        <nav>
          <ul className="flex flex-col items-center justify-end space-y-4">
            <li className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-white dark:bg-slate-950">
              <Moon className="hidden h-6 w-6 dark:block" />
              <Sun className="block h-6 w-6 dark:hidden" />
            </li>
            <li className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-white dark:bg-slate-950">
              <Settings className="h-6 w-6" />
            </li>
            <li className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-white dark:bg-slate-950">
              <CircleUser className="h-6 w-6" />
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}

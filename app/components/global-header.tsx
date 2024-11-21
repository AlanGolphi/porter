'use client'
import Logo from '@/app/assets/images/logo.png'
import Image from 'next/image'
import Link from 'next/link'

export default function Header() {
  return (
    <header className="fixed left-0 top-0 z-50 h-20 w-full bg-white opacity-90">
      <div className="flex h-full w-full items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center justify-start space-x-2">
            <Image src={Logo} alt="Logo" width={48} height={48} />
            <span className="text-lg font-bold">porter</span>
          </Link>
        </div>
        <nav>
          <ul className="flex space-x-4">
            <li>
              <a href="#" className="text-gray-600 hover:text-gray-900">
                Home
              </a>
            </li>
            <li>
              <a href="#" className="text-gray-600 hover:text-gray-900">
                About
              </a>
            </li>
            <li>
              <a href="#" className="text-gray-600 hover:text-gray-900">
                Contact
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}

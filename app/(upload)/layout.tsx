import dynamic from 'next/dynamic'
import GlobalNavLoading from '../components/global-nav-loading'

const GlobalNav = dynamic(() => import('../components/global-nav'), {
  loading: () => <GlobalNavLoading />,
})

export default function UploadLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <main className="relative flex min-h-dvh w-full min-w-80 bg-backgroundMud p-4 pt-24 md:pl-28 md:pt-4">
      <GlobalNav />
      {children}
    </main>
  )
}

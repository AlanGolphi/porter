import GlobalNav from '../components/global-nav'

export default function UploadLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <main className="relative flex min-h-dvh w-full bg-backgroundMud p-4 md:pl-28">
      <GlobalNav />
      {children}
    </main>
  )
}

import { useTranslations } from 'next-intl'

export function TableHeader() {
  const t = useTranslations('UploadPage.UploadedTable')

  return (
    <header className="flex w-full border-b p-2">
      <nav className="flex w-full justify-between @container">
        <div className="hidden text-nowrap text-center sm:block">{t('Type')}</div>
        <div className="flex flex-col items-start @sm:w-full @sm:flex-row @sm:items-center @sm:justify-evenly">
          <div className="w-40 text-nowrap text-left @sm:text-center">{t('Filename')}</div>
          <div className="w-40 text-nowrap text-left @sm:text-center">{t('Url')}</div>
        </div>
        <div className="basis-1/6 text-nowrap text-center">{t('Actions')}</div>
      </nav>
    </header>
  )
}

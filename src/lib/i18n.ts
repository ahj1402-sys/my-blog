export const locales = ['ko'] as const
export type Locale = typeof locales[number]
export const defaultLocale: Locale = 'ko'

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale)
}

export const languageNames: Record<Locale, string> = {
  ko: '한국어',
}

export function getAlternateLinks(pathname: string) {
  return locales.map((locale) => ({
    locale,
    url: pathname,
  }))
}
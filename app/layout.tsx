import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'OPR NC PICKS — 판매율 대시보드',
  description: '이랜드 리테일 OPR NC PICKS 상품 판매율 대시보드',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={inter.className} style={{ backgroundColor: '#0F1117', color: '#F1F5F9', minHeight: '100vh' }}>
        {children}
      </body>
    </html>
  )
}

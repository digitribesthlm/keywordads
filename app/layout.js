import './globals.css'

export const metadata = {
  title: 'Keyword Management',
  description: 'Search campaign keyword management system',
}

import Navigation from './components/Navigation'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navigation />
        <main className="min-h-screen bg-gray-50">
          {children}
        </main>
      </body>
    </html>
  )
}

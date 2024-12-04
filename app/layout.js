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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </body>
    </html>
  )
}

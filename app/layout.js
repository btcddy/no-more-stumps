import './globals.css'

export const metadata = {
  title: 'NoMoreStumps - Professional Stump Removal',
  description: 'Fast, affordable stump grinding and removal services.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
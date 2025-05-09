export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-background">
      <div className="max-w-3xl mx-auto text-center space-y-8">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">10 Ocean Tenant Association</h1>

        <p className="text-xl md:text-2xl text-muted-foreground">Our website is coming soon. We're working hard to bring you a platform to connect, collaborate, and build a stronger community.</p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <div className="p-6 border rounded-lg bg-card shadow-sm">
            <h2 className="text-xl font-semibold mb-2">Stay Connected</h2>
            <p className="text-muted-foreground">Join our mailing list for updates and community events</p>
          </div>

          <div className="p-6 border rounded-lg bg-card shadow-sm">
            <h2 className="text-xl font-semibold mb-2">Get Involved</h2>
            <p className="text-muted-foreground">We're looking for neighbors to help build our community</p>
          </div>
        </div>

        <div className="mt-12 text-muted-foreground">
          <p>© {new Date().getFullYear()} 10 Ocean Tenant Association</p>
        </div>
      </div>
    </main>
  )
}

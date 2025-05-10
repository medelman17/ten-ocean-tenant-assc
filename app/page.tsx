import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-background">
      {/* Navigation Header */}
      <header className="w-full max-w-6xl mx-auto py-4 mb-8 border-b">
        <nav className="flex justify-between items-center">
          <div className="font-bold text-xl">10 Ocean Tenant Association</div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Sign In
            </Link>
            <Link href="/register">
              <Button variant="default" size="sm">Sign Up</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto text-center space-y-8 flex-1 flex flex-col items-center justify-center">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
          Connect with Your <br /> Tenant Community
        </h1>

        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          A platform to connect, collaborate, and build a stronger community at 10 Ocean.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Link href="/login" className="w-full sm:w-auto">
            <Button size="lg" className="w-full">Get Started</Button>
          </Link>
          <Link href="/register" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full">Create Account</Button>
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <section className="w-full max-w-5xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Community Events</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Stay informed about upcoming events and meetings in our building.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Maintenance Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Submit and track maintenance issues with ease.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resident Directory</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Connect with neighbors and build community relationships.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Developer Testing Links */}
      <section className="w-full max-w-5xl mx-auto mt-16 p-6 border bg-muted/30 rounded-lg">
        <h2 className="text-lg font-medium mb-4">Developer Testing Links</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">Dashboard</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="sm">Login</Button>
          </Link>
          <Link href="/register">
            <Button variant="outline" size="sm">Register</Button>
          </Link>
          <Link href="/dashboard/admin/verify-users">
            <Button variant="outline" size="sm">Admin: Verify Users</Button>
          </Link>
        </div>
      </section>

      <footer className="w-full max-w-5xl mx-auto mt-16 text-center text-muted-foreground py-6">
        <p>© {new Date().getFullYear()} 10 Ocean Tenant Association</p>
      </footer>
    </main>
  )
}

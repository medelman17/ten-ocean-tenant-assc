"use client"

import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RegisterFormValues, registerSchema } from "@/lib/validations/auth"
import { register } from "./actions"

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      acceptTerms: false,
    },
  })

  async function onSubmit(data: RegisterFormValues) {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    // Log the value for debugging
    console.log("Form value for acceptTerms:", data.acceptTerms)

    try {
      const formData = new FormData()
      formData.append("email", data.email)
      formData.append("password", data.password)
      formData.append("confirmPassword", data.confirmPassword)
      formData.append("firstName", data.firstName)
      formData.append("lastName", data.lastName)

      // Debug: Try a direct approach with an HTML checkbox value
      if (data.acceptTerms === true) {
        formData.append("acceptTerms", "on")
      }

      const result = await register(formData)

      if (result && !result.success) {
        setError(result.error || "Registration failed. Please try again.")
        setIsLoading(false)
      } else if (result && result.success) {
        setSuccess(result.message || "Registration successful! Please check your email to confirm your account.")
        setIsLoading(false)
        // Redirect after 3 seconds
        setTimeout(() => {
          router.push("/login")
        }, 3000)
      }
    } catch (err) {
      console.error("Registration error:", err)
      setError("An unexpected error occurred. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <div className="container relative flex-col items-center justify-center grid h-screen lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 h-6 w-6"
          >
            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
          </svg>
          10 Ocean Tenant Association
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &quot;Building a stronger community through connection, communication, and collaboration.&quot;
            </p>
            <footer className="text-sm">10 Ocean Tenant Association</footer>
          </blockquote>
        </div>
      </div>
      <div className="flex items-center justify-center lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Create an account
            </h1>
            <p className="text-sm text-muted-foreground">
              Sign up to join the 10 Ocean Tenant Association
            </p>
          </div>

          <div className="grid gap-6">
            {error && (
              <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-100 text-green-800 text-sm p-3 rounded-md">
                {success}
              </div>
            )}

            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="firstName">First name</Label>
                    <Input
                      id="firstName"
                      placeholder="First name"
                      disabled={isLoading}
                      {...form.register("firstName")}
                    />
                    {form.formState.errors.firstName && (
                      <p className="text-sm text-destructive">{form.formState.errors.firstName.message}</p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="lastName">Last name</Label>
                    <Input
                      id="lastName"
                      placeholder="Last name"
                      disabled={isLoading}
                      {...form.register("lastName")}
                    />
                    {form.formState.errors.lastName && (
                      <p className="text-sm text-destructive">{form.formState.errors.lastName.message}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    disabled={isLoading}
                    {...form.register("email")}
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                  )}
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    disabled={isLoading}
                    {...form.register("password")}
                  />
                  {form.formState.errors.password && (
                    <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
                  )}
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    disabled={isLoading}
                    {...form.register("confirmPassword")}
                  />
                  {form.formState.errors.confirmPassword && (
                    <p className="text-sm text-destructive">{form.formState.errors.confirmPassword.message}</p>
                  )}
                </div>
                
                <div className="flex items-center space-x-2 my-2">
                  <Checkbox
                    id="acceptTerms"
                    disabled={isLoading}
                    checked={form.watch("acceptTerms")}
                    onCheckedChange={(checked) => {
                      form.setValue("acceptTerms", checked === true);
                    }}
                  />
                  <Label htmlFor="acceptTerms" className="text-sm">
                    I agree to the{" "}
                    <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
                      terms and conditions
                    </Link>
                  </Label>
                </div>
                {form.formState.errors.acceptTerms && (
                  <p className="text-sm text-destructive -mt-2">{form.formState.errors.acceptTerms.message}</p>
                )}
                
                <Button disabled={isLoading} className="mt-2">
                  {isLoading && (
                    <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                  )}
                  Create account
                </Button>
              </div>
            </form>
          </div>

          <p className="px-8 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="underline underline-offset-4 hover:text-primary"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
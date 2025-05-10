"use server"

import { z } from "zod"

import { createClient } from "@/lib/supabase/server"
import { registerSchema } from "@/lib/validations/auth"

export async function register(formData: FormData) {
  const supabase = await createClient()

  // Extract data from form
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string
  const firstName = formData.get("firstName") as string
  const lastName = formData.get("lastName") as string

  // Fix for checkbox value: accept any truthy value including "on", "true"
  const acceptTermsValue = formData.get("acceptTerms")
  const acceptTerms = acceptTermsValue === "on" ||
                     acceptTermsValue === "true" ||
                     acceptTermsValue === "1" ||
                     acceptTermsValue === "yes"

  // Validate form data
  try {
    registerSchema.parse({
      email,
      password,
      confirmPassword,
      firstName,
      lastName,
      acceptTerms,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: "Invalid form data" }
  }

  // Register user with Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm`,
    },
  })

  if (error) {
    return { 
      success: false, 
      error: error.message || "Registration failed" 
    }
  }

  // Create user profile record
  const { error: profileError } = await supabase
    .from("user_profiles")
    .insert({
      id: data.user?.id,
      first_name: firstName,
      last_name: lastName,
      display_name: `${firstName} ${lastName}`,
      verification_status: "pending",
    })

  if (profileError) {
    console.error("Failed to create user profile:", profileError)
    return {
      success: false,
      error: "Account created but profile setup failed. Please contact support."
    }
  }

  // Trigger user registration workflow via Inngest
  try {
    const { inngest } = await import("@/lib/inngest/client")
    await inngest.send({
      name: "user/registered",
      data: {
        userId: data.user?.id || "",
        email,
        firstName,
        lastName,
        createdAt: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error("Failed to trigger verification workflow:", error)
    // Don't fail registration if Inngest event fails, but log it
  }

  return { 
    success: true, 
    message: "Registration successful! Please check your email to confirm your account." 
  }
}
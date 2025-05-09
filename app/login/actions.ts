"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { z } from "zod"

import { createClient } from "@/lib/supabase/server"
import { loginSchema } from "@/lib/validations/auth"

export async function login(formData: FormData) {
  const cookieStore = cookies()
  const supabase = await createClient()

  // Extract data from form
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  // Validate form data
  try {
    loginSchema.parse({ email, password })
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Return validation errors to the client
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: "Invalid form data" }
  }

  // Attempt to sign in
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    // Return the error to the client rather than redirecting
    return {
      success: false,
      error: error.message || "Authentication failed"
    }
  }

  revalidatePath("/", "layout")
  redirect("/dashboard")
}

// This will be moved to the register page actions
export async function signup(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    return { success: false, error: error.message || "Registration failed" }
  }

  return {
    success: true,
    message: "Registration successful! Please check your email to confirm your account."
  }
}

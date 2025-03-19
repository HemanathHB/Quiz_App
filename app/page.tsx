"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"

export default function Home() {
  const [topic, setTopic] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!topic) return

    setLoading(true)

    try {
      // Store the topic in session storage
      sessionStorage.setItem("quizTopic", topic)

      // Navigate to the quiz page
      router.push("/quiz")
    } catch (error) {
      console.error("Error:", error)
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-purple-800 mb-4">AI Quiz Generator</h1>
            <p className="text-lg text-purple-600">
              Generate quizzes on any topic using AI and get personalized recommendations
            </p>
          </div>

          <Card className="border-purple-200 shadow-lg">
            <CardHeader className="bg-purple-50 rounded-t-lg">
              <CardTitle className="text-2xl text-purple-800">Start Your Quiz</CardTitle>
              <CardDescription>Enter the topic you want to be quizzed on</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit}>
                <div className="grid gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="topic" className="text-purple-700">
                      Quiz Topic
                    </Label>
                    <Input
                      id="topic"
                      type="text"
                      placeholder="e.g., JavaScript Basics, World History, Machine Learning"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                      required
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full mt-6 bg-purple-600 hover:bg-purple-700 text-white"
                  disabled={loading}
                >
                  {loading ? "Generating Quiz..." : "Generate Quiz"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}


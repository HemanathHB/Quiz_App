"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function ApiKeyForm() {
  const [apiKey, setApiKey] = useState("")
  const [topic, setTopic] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!apiKey || !topic) return

    setLoading(true)

    try {
      // Store the API key and topic in session storage
      sessionStorage.setItem("geminiApiKey", apiKey)
      sessionStorage.setItem("quizTopic", topic)

      // Navigate to the quiz page
      router.push("/quiz")
    } catch (error) {
      console.error("Error:", error)
      setLoading(false)
    }
  }

  return (
    <Card className="border-purple-200 shadow-lg">
      <CardHeader className="bg-purple-50 rounded-t-lg">
        <CardTitle className="text-2xl text-purple-800">Start Your Quiz</CardTitle>
        <CardDescription>Enter your Gemini API key and the topic you want to be quizzed on</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="apiKey" className="text-purple-700">
                Gemini API Key
              </Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Enter your Gemini API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                required
              />
            </div>
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
          <Button type="submit" className="w-full mt-6 bg-purple-600 hover:bg-purple-700 text-white" disabled={loading}>
            {loading ? "Generating Quiz..." : "Generate Quiz"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center text-sm text-gray-500 border-t border-purple-100 pt-4">
        Your API key is stored locally and never sent to our servers
      </CardFooter>
    </Card>
  )
}


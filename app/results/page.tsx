"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Award, BookOpen, Brain, ChevronRight, Lightbulb, CheckCircle, XCircle } from "lucide-react"
import { generateRecommendations } from "@/lib/gemini-api"

interface Question {
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

interface Recommendation {
  skills: string[]
  courses: {
    title: string
    description: string
  }[]
  tips: string[]
}

export default function ResultsPage() {
  const router = useRouter()
  const [score, setScore] = useState<number | null>(null)
  const [totalQuestions, setTotalQuestions] = useState<number | null>(null)
  const [topic, setTopic] = useState<string | null>(null)
  const [percentage, setPercentage] = useState<number>(0)
  const [recommendations, setRecommendations] = useState<Recommendation | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<number[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get score and topic from session storage
    const storedScore = sessionStorage.getItem("quizScore")
    const storedTotalQuestions = sessionStorage.getItem("quizTotalQuestions")
    const storedTopic = sessionStorage.getItem("quizTopic")
    const storedQuestions = sessionStorage.getItem("quizQuestions")
    const storedAnswers = sessionStorage.getItem("quizAnswers")

    if (!storedScore || !storedTotalQuestions || !storedTopic || !storedQuestions || !storedAnswers) {
      router.push("/")
      return
    }

    const scoreNum = Number.parseInt(storedScore)
    const totalNum = Number.parseInt(storedTotalQuestions)

    setScore(scoreNum)
    setTotalQuestions(totalNum)
    setTopic(storedTopic)
    setPercentage(Math.round((scoreNum / totalNum) * 100))
    setQuestions(JSON.parse(storedQuestions))
    setAnswers(JSON.parse(storedAnswers))

    // Generate recommendations based on score
    fetchRecommendations(scoreNum, totalNum, storedTopic)
  }, [router])

  const fetchRecommendations = async (score: number, total: number, topic: string) => {
    setLoading(true)
    try {
      const recs = await generateRecommendations(score, total, topic)
      setRecommendations(recs)
      setLoading(false)
    } catch (error: any) {
      console.error("Error generating recommendations:", error)
      // We'll still get default recommendations from the function
      setLoading(false)
    }
  }

  if (score === null || totalQuestions === null || topic === null || !recommendations) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-3xl border-purple-200 shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 text-purple-600 animate-spin mb-4" />
            <p className="text-lg text-purple-800 font-medium">Analyzing your results...</p>
            <p className="text-sm text-gray-500 mt-2">Generating personalized recommendations</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <Card className="border-purple-200 shadow-lg mb-8">
          <CardHeader className="bg-purple-50 rounded-t-lg">
            <CardTitle className="text-2xl text-purple-800 text-center">Your Quiz Results</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-purple-100 mb-4">
                <span className="text-3xl font-bold text-purple-800">{percentage}%</span>
              </div>
              <h3 className="text-xl font-medium text-gray-800">
                You scored {score} out of {totalQuestions} on {topic}
              </h3>
              <p className="text-gray-600 mt-2">
                {percentage >= 80
                  ? "Excellent! You have a strong understanding of this topic."
                  : percentage >= 60
                    ? "Good job! You have a solid grasp of the basics."
                    : "Keep learning! You're making progress."}
              </p>
            </div>

            <div className="mb-8">
              <h4 className="text-lg font-medium text-purple-800 mb-3">Question Review</h4>
              <div className="space-y-4">
                {questions.map((question, index) => (
                  <div key={index} className="border border-purple-100 rounded-lg p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-3 mt-1">
                        {answers[index] === question.correctAnswer ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 mb-2">{question.question}</p>
                        <p className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">Your answer:</span> {question.options[answers[index]]}
                        </p>
                        {answers[index] !== question.correctAnswer && (
                          <p className="text-sm text-green-600 mb-2">
                            <span className="font-medium">Correct answer:</span>{" "}
                            {question.options[question.correctAnswer]}
                          </p>
                        )}
                        <p className="text-sm text-gray-700 mt-2 bg-purple-50 p-2 rounded">
                          <span className="font-medium">Explanation:</span> {question.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-lg font-medium text-purple-800 mb-3 flex items-center">
                <Brain className="mr-2 h-5 w-5" /> Skill Development Recommendations
              </h4>
              <div className="bg-purple-50 rounded-lg p-4">
                <ul className="space-y-2">
                  {recommendations.skills.map((rec, index) => (
                    <li key={index} className="flex items-start">
                      <ChevronRight className="h-5 w-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-medium text-purple-800 mb-3 flex items-center">
                <BookOpen className="mr-2 h-5 w-5" /> Recommended Courses
              </h4>
              <div className="space-y-4">
                {recommendations.courses.map((course, index) => (
                  <div
                    key={index}
                    className="border border-purple-200 rounded-lg p-4 hover:bg-purple-50 transition-colors"
                  >
                    <h5 className="font-medium text-purple-700 mb-1 flex items-center">
                      <Award className="h-4 w-4 mr-2" />
                      {course.title}
                    </h5>
                    <p className="text-gray-600 text-sm">{course.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-purple-100 pt-4">
            <Button onClick={() => router.push("/")} className="bg-purple-600 hover:bg-purple-700 text-white">
              Create Another Quiz
            </Button>
          </CardFooter>
        </Card>

        <div className="text-center">
          <div className="inline-flex items-center text-purple-700 mb-2">
            <Lightbulb className="h-5 w-5 mr-2" />
            <h3 className="text-lg font-medium">Learning Tips</h3>
          </div>
          <div className="text-gray-600">
            {recommendations.tips.map((tip, index) => (
              <p key={index} className="mb-2">
                {tip}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Add this component for loading state
function Loader2({ className }: { className: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`${className} animate-spin`}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}


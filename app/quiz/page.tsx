"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Loader2 } from "lucide-react"
import { generateQuizQuestions } from "@/lib/gemini-api"

interface Question {
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

export default function QuizPage() {
  const router = useRouter()
  const [topic, setTopic] = useState<string | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Get topic from session storage
    const storedTopic = sessionStorage.getItem("quizTopic")

    if (!storedTopic) {
      router.push("/")
      return
    }

    setTopic(storedTopic)
    fetchQuizQuestions(storedTopic)
  }, [router])

  const fetchQuizQuestions = async (topic: string) => {
    setLoading(true)
    try {
      const quizQuestions = await generateQuizQuestions(topic)
      setQuestions(quizQuestions)
      setLoading(false)
    } catch (err: any) {
      console.error("Error generating quiz:", err)
      setError(err.message || "Failed to generate quiz. Please check your API key and try again.")
      setLoading(false)
    }
  }

  const handleNext = () => {
    if (selectedOption !== null) {
      // Update score
      if (selectedOption === questions[currentQuestion].correctAnswer) {
        setScore(score + 1)
      }

      // Save answer
      const newAnswers = [...answers]
      newAnswers[currentQuestion] = selectedOption
      setAnswers(newAnswers)

      // Move to next question or finish
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
        setSelectedOption(null)
      } else {
        // Store score and answers in session storage
        sessionStorage.setItem("quizScore", score.toString())
        sessionStorage.setItem("quizTotalQuestions", questions.length.toString())
        sessionStorage.setItem("quizAnswers", JSON.stringify(newAnswers))
        sessionStorage.setItem("quizQuestions", JSON.stringify(questions))

        // Navigate to results page
        router.push("/results")
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-3xl border-purple-200 shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 text-purple-600 animate-spin mb-4" />
            <p className="text-lg text-purple-800 font-medium">Generating your quiz on {topic}...</p>
            <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-3xl border-red-200 shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-lg text-red-600 font-medium mb-4">{error}</p>
            <Button onClick={() => router.push("/")} className="bg-purple-600 hover:bg-purple-700 text-white">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (questions.length === 0) {
    return null
  }

  const currentQuestionData = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-3xl border-purple-200 shadow-lg">
        <CardHeader className="bg-purple-50 rounded-t-lg">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl text-purple-800">Quiz on {topic}</CardTitle>
            <span className="text-sm font-medium text-purple-600">
              Question {currentQuestion + 1} of {questions.length}
            </span>
          </div>
          <Progress value={progress} className="h-2 mt-2 bg-purple-100">
            <div className="h-full bg-purple-600 rounded-full" style={{ width: `${progress}%` }} />
          </Progress>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">{currentQuestionData.question}</h3>
            <RadioGroup
              value={selectedOption?.toString()}
              onValueChange={(value) => setSelectedOption(Number.parseInt(value))}
            >
              {currentQuestionData.options.map((option, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 mb-3 p-3 rounded-md hover:bg-purple-50 transition-colors"
                >
                  <RadioGroupItem
                    value={index.toString()}
                    id={`option-${index}`}
                    className="text-purple-600 border-purple-400"
                  />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t border-purple-100 pt-4">
          <Button
            variant="outline"
            onClick={() => {
              if (currentQuestion > 0) {
                setCurrentQuestion(currentQuestion - 1)
                setSelectedOption(answers[currentQuestion - 1])
              }
            }}
            disabled={currentQuestion === 0}
            className="border-purple-200 text-purple-700 hover:bg-purple-50"
          >
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={selectedOption === null}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {currentQuestion < questions.length - 1 ? "Next" : "Finish Quiz"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}


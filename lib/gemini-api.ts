import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI("")

// Define interfaces
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

// Function to get a model instance
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" })

// Generate Quiz Questions
export async function generateQuizQuestions(topic: string): Promise<Question[]> {
  const prompt = `
    Generate 5 multiple-choice quiz questions about "${topic}". 

    For each question:
    1. Provide a clear, concise question
    2. Provide 4 possible answers (options)
    3. Indicate which option is correct (as a number 0-3, where 0 is the first option)
    4. Include a brief explanation of why the correct answer is right

    Return the result as a valid JSON array with this structure:
    [
      {
        "question": "Question text here?",
        "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
        "correctAnswer": 0,
        "explanation": "Explanation of the correct answer"
      },
      ...
    ]
    
    Make sure the questions are diverse and cover different aspects of ${topic}.
    Ensure the options are plausible and not obviously wrong.
  `

  try {
    console.log(`Generating questions for topic: ${topic}`)
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    console.log("Received response from Gemini API")

    try {
      const cleanedText = text.replace(/```json|```/g, "").trim()
      const questions = JSON.parse(cleanedText) as Question[]
      return questions
    } catch (parseError) {
      console.error("Error parsing JSON response:", parseError)
      console.error("Raw response:", text)
      throw new Error("Failed to parse quiz questions from API response.")
    }
  } catch (error: any) {
    console.error("Error generating quiz questions:", error)
    throw new Error(`Failed to generate quiz questions: ${error.message || "Unknown error"}`)
  }
}

// Generate Recommendations
export async function generateRecommendations(
  score: number,
  totalQuestions: number,
  topic: string,
): Promise<Recommendation> {
  const percentage = (score / totalQuestions) * 100
  const level = percentage >= 80 ? "advanced" : percentage >= 60 ? "intermediate" : "beginner"

  const prompt = `
    Based on a quiz about "${topic}" where the user scored ${score}/${totalQuestions} (${percentage}%), 
    which puts them at a "${level}" level, generate personalized learning recommendations.
    
    Return the result as a valid JSON object with this structure:
    {
      "skills": [
        "Skill recommendation 1",
        "Skill recommendation 2",
        "Skill recommendation 3",
        "Skill recommendation 4"
      ],
      "courses": [
        {
          "title": "Course title 1",
          "description": "Brief description of the course"
        },
        {
          "title": "Course title 2",
          "description": "Brief description of the course"
        },
        {
          "title": "Course title 3",
          "description": "Brief description of the course"
        }
      ],
      "tips": [
        "Learning tip 1",
        "Learning tip 2"
      ]
    }
    
    Make the recommendations specific to "${topic}" and appropriate for a "${level}" level learner.
  `

  try {
    console.log(`Generating recommendations for topic: ${topic}, score: ${score}/${totalQuestions}`)
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    console.log("Received recommendations from Gemini API")

    try {
      const cleanedText = text.replace(/```json|```/g, "").trim()
      const recommendations = JSON.parse(cleanedText) as Recommendation
      return recommendations
    } catch (parseError) {
      console.error("Error parsing JSON response:", parseError)
      console.error("Raw response:", text)
      return getDefaultRecommendations(topic, level)
    }
  } catch (error) {
    console.error("Error generating recommendations:", error)
    return getDefaultRecommendations(topic, level)
  }
}

// Fallback: Default Recommendations
function getDefaultRecommendations(topic: string, level: string): Recommendation {
  return {
    skills: [
      `Learn the fundamentals of ${topic}`,
      `Practice ${topic} regularly`,
      `Join communities related to ${topic}`,
      `Read books and articles about ${topic}`,
    ],
    courses: [
      {
        title: `${topic} for ${level === "beginner" ? "Beginners" : level === "intermediate" ? "Intermediate Learners" : "Advanced Users"}`,
        description: `A comprehensive course on ${topic} designed for ${level} level learners.`,
      },
      {
        title: `Practical ${topic}`,
        description: `Hands-on projects and exercises to improve your ${topic} skills.`,
      },
      {
        title: `Advanced ${topic} Concepts`,
        description: `Deep dive into complex aspects of ${topic} for those looking to master the subject.`,
      },
    ],
    tips: [
      `Regular practice is key to mastering ${topic}.`,
      `Try to apply what you learn about ${topic} in real-world scenarios.`,
    ],
  }
}

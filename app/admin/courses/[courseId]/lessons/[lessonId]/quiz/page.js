'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '../../../../../../lib/supabase'

export default function AdminQuizBuilderPage() {
  const router = useRouter()
  const params = useParams()

  const courseId = params?.courseId
  const lessonId = params?.lessonId

  const [loading, setLoading] = useState(true)
  const [savingQuiz, setSavingQuiz] = useState(false)
  const [addingQuestion, setAddingQuestion] = useState(false)

  const [lesson, setLesson] = useState(null)
  const [quiz, setQuiz] = useState(null)
  const [questions, setQuestions] = useState([])

  const [quizTitle, setQuizTitle] = useState('')
  const [passingScore, setPassingScore] = useState(70)

  const [questionText, setQuestionText] = useState('')
  const [explanation, setExplanation] = useState('')

  const [options, setOptions] = useState([
    { text: '', correct: true },
    { text: '', correct: false },
    { text: '', correct: false },
    { text: '', correct: false },
  ])

  useEffect(() => {
    if (lessonId) {
      loadPage()
    }
  }, [lessonId])

  async function loadPage() {
    try {
      setLoading(true)

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user) {
        router.replace('/login')
        return
      }

      const { data: profile, error: profileError } =
        await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()

      if (profileError) {
        throw profileError
      }

      if (profile?.role !== 'admin') {
        router.replace('/dashboard')
        return
      }

      const { data: lessonData, error: lessonError } =
        await supabase
          .from('lessons')
          .select('id, title, module_id')
          .eq('id', lessonId)
          .single()

      if (lessonError) {
        throw lessonError
      }

      setLesson(lessonData)

      const { data: quizData, error: quizError } =
        await supabase
          .from('quizzes')
          .select('*')
          .eq('lesson_id', lessonId)
          .maybeSingle()

      if (quizError) {
        throw quizError
      }

      if (!quizData) {
        setQuiz(null)
        setQuizTitle(`${lessonData.title} Quiz`)
        setPassingScore(70)
        setQuestions([])
        return
      }

      setQuiz(quizData)
      setQuizTitle(quizData.title || '')
      setPassingScore(quizData.passing_score ?? 70)

      await loadQuestions(quizData.id)
    } catch (error) {
      console.error('Quiz builder load error:', error)
      alert(error?.message || 'Quiz мэдээлэл ачааллахад алдаа гарлаа.')
    } finally {
      setLoading(false)
    }
  }

  async function loadQuestions(quizId) {
    const { data: questionData, error: questionError } =
      await supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', quizId)
        .order('position', {
          ascending: true,
        })

    if (questionError) {
      throw questionError
    }

    const questionIds = (questionData || []).map(
      (item) => item.id
    )

    let optionData = []

    if (questionIds.length > 0) {
      const { data, error } = await supabase
        .from('quiz_options')
        .select('*')
        .in('question_id', questionIds)
        .order('position', {
          ascending: true,
        })

      if (error) {
        throw error
      }

      optionData = data || []
    }

    const combined = (questionData || []).map(
      (question) => ({
        ...question,
        options: optionData.filter(
          (option) =>
            option.question_id === question.id
        ),
      })
    )

    setQuestions(combined)
  }

  async function saveQuiz() {
    if (!quizTitle.trim()) {
      alert('Quiz title оруулна уу.')
      return
    }

    const score = Number(passingScore)

    if (
      Number.isNaN(score) ||
      score < 0 ||
      score > 100
    ) {
      alert('Passing score 0–100 хооронд байна.')
      return
    }

    try {
      setSavingQuiz(true)

      if (quiz) {
        const { data, error } = await supabase
          .from('quizzes')
          .update({
            title: quizTitle.trim(),
            passing_score: score,
          })
          .eq('id', quiz.id)
          .select()
          .single()

        if (error) {
          throw error
        }

        setQuiz(data)
        alert('Quiz хадгалагдлаа.')
        return
      }

      const { data, error } = await supabase
        .from('quizzes')
        .insert({
          lesson_id: lessonId,
          title: quizTitle.trim(),
          passing_score: score,
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      setQuiz(data)
      setQuestions([])

      alert('Quiz амжилттай үүслээ.')
    } catch (error) {
      console.error('Save quiz error:', error)

      alert(
        error?.message ||
          'Quiz хадгалах үед алдаа гарлаа.'
      )
    } finally {
      setSavingQuiz(false)
    }
  }

  function updateOptionText(index, value) {
    setOptions((current) =>
      current.map((option, optionIndex) =>
        optionIndex === index
          ? {
              ...option,
              text: value,
            }
          : option
      )
    )
  }

  function setCorrectOption(index) {
    setOptions((current) =>
      current.map((option, optionIndex) => ({
        ...option,
        correct: optionIndex === index,
      }))
    )
  }

  function resetQuestionForm() {
    setQuestionText('')
    setExplanation('')

    setOptions([
      { text: '', correct: true },
      { text: '', correct: false },
      { text: '', correct: false },
      { text: '', correct: false },
    ])
  }

  async function addQuestion() {
    if (!quiz?.id) {
      alert('Эхлээд Quiz хадгална уу.')
      return
    }

    if (!questionText.trim()) {
      alert('Асуултаа оруулна уу.')
      return
    }

    const cleanedOptions = options.map((option) => ({
      ...option,
      text: option.text.trim(),
    }))

    if (
      cleanedOptions.some(
        (option) => !option.text
      )
    ) {
      alert('4 хариултаа бүгдийг оруулна уу.')
      return
    }

    if (
      cleanedOptions.filter(
        (option) => option.correct
      ).length !== 1
    ) {
      alert('Зөвхөн 1 зөв хариулт сонгоно уу.')
      return
    }

    try {
      setAddingQuestion(true)

      const nextPosition = questions.length + 1

      const {
        data: newQuestion,
        error: questionError,
      } = await supabase
        .from('quiz_questions')
        .insert({
          quiz_id: quiz.id,
          question: questionText.trim(),
          explanation:
            explanation.trim() || null,
          position: nextPosition,
        })
        .select()
        .single()

      if (questionError) {
        throw questionError
      }

      const optionRows = cleanedOptions.map(
        (option, index) => ({
          question_id: newQuestion.id,
          option_text: option.text,
          is_correct: option.correct,
          position: index + 1,
        })
      )

      const { error: optionError } =
        await supabase
          .from('quiz_options')
          .insert(optionRows)

      if (optionError) {
        await supabase
          .from('quiz_questions')
          .delete()
          .eq('id', newQuestion.id)

        throw optionError
      }

      resetQuestionForm()

      await loadQuestions(quiz.id)
    } catch (error) {
      console.error('Add question error:', error)

      alert(
        error?.message ||
          'Асуулт нэмэх үед алдаа гарлаа.'
      )
    } finally {
      setAddingQuestion(false)
    }
  }

  async function deleteQuestion(questionId) {
    const confirmed = window.confirm(
      'Энэ асуултыг устгах уу?'
    )

    if (!confirmed) {
      return
    }

    try {
      const { error: optionError } =
        await supabase
          .from('quiz_options')
          .delete()
          .eq('question_id', questionId)

      if (optionError) {
        throw optionError
      }

      const { error: questionError } =
        await supabase
          .from('quiz_questions')
          .delete()
          .eq('id', questionId)

      if (questionError) {
        throw questionError
      }

      await loadQuestions(quiz.id)
    } catch (error) {
      console.error('Delete question error:', error)

      alert(
        error?.message ||
          'Асуулт устгахад алдаа гарлаа.'
      )
    }
  }

  async function deleteQuiz() {
    if (!quiz?.id) {
      return
    }

    const confirmed = window.confirm(
      'Quiz болон бүх асуултыг устгах уу?'
    )

    if (!confirmed) {
      return
    }

    try {
      const questionIds = questions.map(
        (question) => question.id
      )

      if (questionIds.length > 0) {
        const { error: optionsError } =
          await supabase
            .from('quiz_options')
            .delete()
            .in('question_id', questionIds)

        if (optionsError) {
          throw optionsError
        }

        const { error: questionsError } =
          await supabase
            .from('quiz_questions')
            .delete()
            .eq('quiz_id', quiz.id)

        if (questionsError) {
          throw questionsError
        }
      }

      const { error: quizError } =
        await supabase
          .from('quizzes')
          .delete()
          .eq('id', quiz.id)

      if (quizError) {
        throw quizError
      }

      setQuiz(null)
      setQuestions([])
      setQuizTitle(
        lesson
          ? `${lesson.title} Quiz`
          : 'Quiz'
      )
      setPassingScore(70)
      resetQuestionForm()
    } catch (error) {
      console.error('Delete quiz error:', error)

      alert(
        error?.message ||
          'Quiz устгах үед алдаа гарлаа.'
      )
    }
  }

  if (loading) {
    return (
      <div className="loading">
        Quiz builder ачааллаж байна...

        <style jsx>{`
          .loading {
            padding: 50px 30px;
            color: #9995a4;
          }
        `}</style>
      </div>
    )
  }

  return (
    <main className="page">
      <button
        className="back"
        onClick={() =>
          router.push(
            `/admin/courses/${courseId}`
          )
        }
      >
        ← Course builder
      </button>

      <header>
        <div>
          <div className="eyebrow">
            QUIZ BUILDER
          </div>

          <h1>
            {lesson?.title || 'Lesson'} Quiz
          </h1>

          <p>
            Quiz үүсгэж, асуулт болон 4
            сонголт нэмнэ.
          </p>
        </div>
      </header>

      <section className="card">
        <div className="section-label">
          QUIZ SETTINGS
        </div>

        <div className="settings">
          <div>
            <label>Quiz title</label>

            <input
              value={quizTitle}
              onChange={(event) =>
                setQuizTitle(event.target.value)
              }
              placeholder="Lesson Quiz"
            />
          </div>

          <div>
            <label>Passing score (%)</label>

            <input
              type="number"
              min="0"
              max="100"
              value={passingScore}
              onChange={(event) =>
                setPassingScore(
                  event.target.value
                )
              }
            />
          </div>
        </div>

        <div className="quiz-actions">
          <button
            className="primary"
            onClick={saveQuiz}
            disabled={savingQuiz}
          >
            {savingQuiz
              ? 'Хадгалж байна...'
              : quiz
                ? 'Quiz хадгалах'
                : 'Quiz үүсгэх'}
          </button>

          {quiz && (
            <button
              className="danger-outline"
              onClick={deleteQuiz}
            >
              Quiz устгах
            </button>
          )}
        </div>
      </section>

      {quiz && (
        <>
          <section className="card">
            <div className="section-label">
              ADD QUESTION
            </div>

            <h2>Шинэ асуулт</h2>

            <label>Асуулт</label>

            <textarea
              rows={3}
              value={questionText}
              onChange={(event) =>
                setQuestionText(
                  event.target.value
                )
              }
              placeholder="Асуултаа бичнэ үү..."
            />

            <label>Тайлбар</label>

            <textarea
              rows={2}
              value={explanation}
              onChange={(event) =>
                setExplanation(
                  event.target.value
                )
              }
              placeholder="Зөв хариултын тайлбар (optional)"
            />

            <div className="options">
              {options.map(
                (option, index) => (
                  <div
                    className={`option-row ${
                      option.correct
                        ? 'correct'
                        : ''
                    }`}
                    key={index}
                  >
                    <button
                      type="button"
                      className="radio"
                      onClick={() =>
                        setCorrectOption(index)
                      }
                    >
                      {option.correct
                        ? '✓'
                        : ''}
                    </button>

                    <div className="option-letter">
                      {String.fromCharCode(
                        65 + index
                      )}
                    </div>

                    <input
                      value={option.text}
                      onChange={(event) =>
                        updateOptionText(
                          index,
                          event.target.value
                        )
                      }
                      placeholder={`Хариулт ${index + 1}`}
                    />

                    {option.correct && (
                      <span className="correct-label">
                        CORRECT
                      </span>
                    )}
                  </div>
                )
              )}
            </div>

            <button
              className="primary add-button"
              onClick={addQuestion}
              disabled={addingQuestion}
            >
              {addingQuestion
                ? 'Нэмж байна...'
                : '+ Асуулт нэмэх'}
            </button>
          </section>

          <section className="card">
            <div className="list-header">
              <div>
                <div className="section-label">
                  QUESTIONS
                </div>

                <h2>
                  Нийт {questions.length} асуулт
                </h2>
              </div>
            </div>

            {questions.length === 0 ? (
              <div className="empty">
                Одоогоор асуулт байхгүй.
              </div>
            ) : (
              <div className="question-list">
                {questions.map(
                  (question, index) => (
                    <article
                      className="question"
                      key={question.id}
                    >
                      <div className="question-top">
                        <div>
                          <span className="number">
                            QUESTION {index + 1}
                          </span>

                          <h3>
                            {question.question}
                          </h3>
                        </div>

                        <button
                          className="delete"
                          onClick={() =>
                            deleteQuestion(
                              question.id
                            )
                          }
                        >
                          Устгах
                        </button>
                      </div>

                      <div className="saved-options">
                        {(question.options || []).map(
                          (option, optionIndex) => (
                            <div
                              className={`saved-option ${
                                option.is_correct
                                  ? 'correct'
                                  : ''
                              }`}
                              key={option.id}
                            >
                              <span>
                                {String.fromCharCode(
                                  65 + optionIndex
                                )}
                              </span>

                              <strong>
                                {option.option_text}
                              </strong>

                              {option.is_correct && (
                                <b>✓ Зөв</b>
                              )}
                            </div>
                          )
                        )}
                      </div>

                      {question.explanation && (
                        <div className="explanation">
                          <span>EXPLANATION</span>
                          {question.explanation}
                        </div>
                      )}
                    </article>
                  )
                )}
              </div>
            )}
          </section>
        </>
      )}

      <style jsx>{`
        .page {
          width: 100%;
          max-width: 1000px;
          padding: 42px 32px 100px;
          color: #302e38;
        }

        .back {
          margin-bottom: 22px;
          padding: 0;
          border: 0;
          background: transparent;
          color: #8c8794;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        header {
          margin-bottom: 25px;
        }

        .eyebrow,
        .section-label,
        .number {
          color: #6c5ce7;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.14em;
        }

        header h1 {
          margin: 8px 0;
          font-size: 30px;
        }

        header p {
          margin: 0;
          color: #9994a1;
          font-size: 13px;
        }

        .card {
          margin-bottom: 20px;
          padding: 25px;
          border: 1px solid #e6e2ec;
          border-radius: 19px;
          background: white;
        }

        .card h2 {
          margin: 8px 0 20px;
          font-size: 19px;
        }

        .settings {
          display: grid;
          grid-template-columns: 1fr 180px;
          gap: 15px;
          margin-top: 18px;
        }

        label {
          display: block;
          margin: 14px 0 7px;
          color: #67616e;
          font-size: 11px;
          font-weight: 800;
        }

        input,
        textarea {
          width: 100%;
          padding: 12px 13px;
          border: 1px solid #e0dce7;
          border-radius: 10px;
          outline: none;
          background: #fbfaff;
          color: #38343e;
          font: inherit;
        }

        input:focus,
        textarea:focus {
          border-color: #6c5ce7;
        }

        textarea {
          resize: vertical;
        }

        .quiz-actions {
          display: flex;
          gap: 9px;
          margin-top: 18px;
        }

        .primary,
        .danger-outline,
        .delete {
          border-radius: 10px;
          font-size: 11px;
          font-weight: 800;
          cursor: pointer;
        }

        .primary {
          padding: 12px 17px;
          border: 0;
          background: #6c5ce7;
          color: white;
        }

        .primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .danger-outline {
          padding: 11px 15px;
          border: 1px solid #efced1;
          background: white;
          color: #c2535c;
        }

        .options {
          display: flex;
          flex-direction: column;
          gap: 9px;
          margin-top: 20px;
        }

        .option-row {
          display: grid;
          grid-template-columns:
            32px 30px 1fr auto;
          align-items: center;
          gap: 9px;
          padding: 9px;
          border: 1px solid #e7e2ec;
          border-radius: 12px;
        }

        .option-row.correct {
          border-color: #bfe3cc;
          background: #f5fcf7;
        }

        .radio {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border: 1px solid #dcd7e4;
          border-radius: 50%;
          background: white;
          color: #348056;
          font-weight: 900;
          cursor: pointer;
        }

        .correct .radio {
          border-color: #55a976;
          background: #e5f6eb;
        }

        .option-letter {
          color: #918b98;
          font-size: 10px;
          font-weight: 900;
          text-align: center;
        }

        .correct-label {
          padding: 6px 8px;
          border-radius: 999px;
          background: #e4f5ea;
          color: #318052;
          font-size: 8px;
          font-weight: 900;
        }

        .add-button {
          width: 100%;
          margin-top: 18px;
        }

        .question-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .question {
          padding: 20px;
          border: 1px solid #ebe7f0;
          border-radius: 15px;
          background: #fcfbfe;
        }

        .question-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
        }

        .question h3 {
          margin: 7px 0 15px;
          font-size: 15px;
          line-height: 1.55;
        }

        .delete {
          flex: 0 0 auto;
          padding: 8px 10px;
          border: 1px solid #efd6d8;
          background: white;
          color: #be555d;
        }

        .saved-options {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 7px;
        }

        .saved-option {
          display: grid;
          grid-template-columns: 27px 1fr auto;
          align-items: center;
          gap: 8px;
          padding: 10px;
          border: 1px solid #e7e3eb;
          border-radius: 9px;
          background: white;
        }

        .saved-option span {
          color: #9993a0;
          font-size: 9px;
          font-weight: 900;
        }

        .saved-option strong {
          color: #5c5662;
          font-size: 11px;
        }

        .saved-option.correct {
          border-color: #c6e6d1;
          background: #f2faf5;
        }

        .saved-option b {
          color: #348056;
          font-size: 9px;
        }

        .explanation {
          margin-top: 12px;
          padding: 12px;
          border-radius: 9px;
          background: #f4f2fa;
          color: #77717e;
          font-size: 11px;
          line-height: 1.6;
        }

        .explanation span {
          display: block;
          margin-bottom: 5px;
          color: #9c96a3;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 0.12em;
        }

        .empty {
          padding: 35px;
          color: #9994a1;
          text-align: center;
          font-size: 12px;
        }

        @media (max-width: 650px) {
          .page {
            padding: 28px 16px 100px;
          }

          .card {
            padding: 19px;
          }

          .settings {
            grid-template-columns: 1fr;
          }

          .option-row {
            grid-template-columns:
              30px 25px 1fr;
          }

          .correct-label {
            display: none;
          }

          .saved-options {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  )
}
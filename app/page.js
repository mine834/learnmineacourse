'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from './lib/supabase'

const LEARNING_STYLE_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSeXlz4epv6gct8r39FNiDUETu02neT5kxgwzM1jNjzj9Ts44g/viewform?usp=header'

export default function HomePage() {
  const [products, setProducts] = useState([])
  const [courses, setCourses] = useState([])
  const [modules, setModules] = useState([])
  const [lessons, setLessons] = useState([])

  const [hero, setHero] = useState(null)
  const [notice, setNotice] = useState(null)

  const [processType, setProcessType] =
    useState('course')

  const [loading, setLoading] =
    useState(true)

  useEffect(() => {
    loadHomepage()
  }, [])

  async function loadHomepage() {
    setLoading(true)

    const [
      productsResult,
      coursesResult,
      contentResult,
    ] = await Promise.all([
      supabase
        .from('products')
        .select('*')
        .eq('published', true)
        .order('created_at', {
          ascending: false,
        }),

      supabase
        .from('courses')
        .select('*')
        .eq('published', true)
        .order('created_at', {
          ascending: false,
        }),

      supabase
        .from('site_content')
        .select('*')
        .in('content_key', [
          'homepage_hero',
          'homepage_notice',
        ])
        .eq('published', true),
    ])

    const productData =
      productsResult.data || []

    const courseData =
      coursesResult.data || []

    setProducts(productData)
    setCourses(courseData)

    const contentData =
      contentResult.data || []

    setHero(
      contentData.find(
        (item) =>
          item.content_key ===
          'homepage_hero'
      ) || null
    )

    setNotice(
      contentData.find(
        (item) =>
          item.content_key ===
          'homepage_notice'
      ) || null
    )

    /*
      modules / lessons нь student RLS-ээс
      шалтгаалаад public homepage дээр
      харагдахгүй байж болно.

      Public access байгаа бол lesson preview
      автоматаар гарна.
    */

    if (courseData.length > 0) {
      const courseIds =
        courseData.map(
          (course) => course.id
        )

      const {
        data: moduleData,
      } = await supabase
        .from('modules')
        .select('*')
        .in('course_id', courseIds)
        .order('position', {
          ascending: true,
        })

      const safeModules =
        moduleData || []

      setModules(safeModules)

      if (safeModules.length > 0) {
        const moduleIds =
          safeModules.map(
            (module) => module.id
          )

        const {
          data: lessonData,
        } = await supabase
          .from('lessons')
          .select(
            'id,title,module_id,position,published'
          )
          .in(
            'module_id',
            moduleIds
          )
          .eq('published', true)
          .order('position', {
            ascending: true,
          })

        setLessons(
          lessonData || []
        )
      }
    }

    setLoading(false)
  }

  const courseCards =
    useMemo(() => {
      return courses.map(
        (course) => {
          const courseModules =
            modules.filter(
              (module) =>
                module.course_id ===
                course.id
            )

          const moduleIds =
            courseModules.map(
              (module) =>
                module.id
            )

          const courseLessons =
            lessons.filter(
              (lesson) =>
                moduleIds.includes(
                  lesson.module_id
                )
            )

          return {
            ...course,
            modules:
              courseModules,
            lessons:
              courseLessons,
          }
        }
      )
    }, [
      courses,
      modules,
      lessons,
    ])

  const heroTitle =
    hero?.title ||
    'Солонгос хэлийг анхны үсгээс шалгалт хүртэл.'

  const heroBody =
    hero?.body ||
    'Солонгос хэл болон TOPIK суралцагчдад зориулсан системтэй онлайн сургалт, цахим ном, дасгал болон суралцах орчин.'

  const heroButtonText =
    hero?.button_text ||
    'Сургалтууд үзэх'

  const heroButtonUrl =
    hero?.button_url ||
    '#courses'

  const courseSteps = [
    {
      number: '01',
      title:
        'Сургалтаа сонгоно',
      text:
        'Өөрийн зорилго, түвшинд тохирох онлайн сургалтаа сонгоно.',
    },
    {
      number: '02',
      title:
        'Төлбөрийн хүсэлт илгээнэ',
      text:
        'Student account-аасаа төлбөрийн мэдээлэл болон баримтаа илгээнэ.',
    },
    {
      number: '03',
      title:
        'Эрх баталгаажна',
      text:
        'Төлбөр шалгагдаж баталгаажсаны дараа тухайн сургалтын эрх нээгдэнэ.',
    },
    {
      number: '04',
      title:
        'Dashboard-аас сурна',
      text:
        'Видео хичээл, quiz, progress болон дараагийн хичээлээ нэг дороос үргэлжлүүлнэ.',
    },
  ]

  const bookSteps = [
    {
      number: '01',
      title:
        'Материалаа сонгоно',
      text:
        'Өөрийн түвшин болон зорилгод тохирох цахим ном, материалаа сонгоно.',
    },
    {
      number: '02',
      title:
        'Захиалга өгнө',
      text:
        'Сонгосон материалын захиалгын холбоосоор хүсэлтээ илгээнэ.',
    },
    {
      number: '03',
      title:
        'Захиалга баталгаажна',
      text:
        'Төлбөр болон захиалгын мэдээллийг шалгаж баталгаажуулна.',
    },
    {
      number: '04',
      title:
        'Материалаа авна',
      text:
        'Баталгаажсаны дараа цахим материалаа хүлээн авч өөрийн хурдаар судална.',
    },
  ]

  const activeSteps =
    processType === 'course'
      ? courseSteps
      : bookSteps

  return (
    <>
      <div className="site">

        {/* HEADER */}
        <header className="header">
          <div className="wrap header-inner">

            <a
              href="#top"
              className="logo"
            >
              <span className="logo-mark">
                한
              </span>

              <span>
                LEARN
                <span className="purple">
                  ·
                </span>
                MINEA
              </span>
            </a>

            <nav>
              <a href="#products">
                Ном
              </a>

              <a href="#courses">
                Сургалт
              </a>

              <a href="#process">
                Хэрхэн ажиллах вэ?
              </a>

              <a href="#learning-style">
                Сурах арга
              </a>

              <a href="#faq">
                Асуулт
              </a>
            </nav>

            <a
              href="/dashboard"
              className="btn btn-primary header-button"
            >
              My Learning
            </a>

          </div>
        </header>


        {/* HERO */}
        <section
          className="hero"
          id="top"
        >
          <div className="wrap hero-grid">

            <div className="hero-copy">

              <div className="eyebrow">
                KOREAN · TOPIK · ONLINE LEARNING
              </div>

              <h1>
                {heroTitle}
              </h1>

              <p className="lead">
                {heroBody}
              </p>

              <div className="hero-buttons">
                <a
                  href={heroButtonUrl}
                  className="btn btn-primary"
                >
                  {heroButtonText}
                </a>

                <a
                  href="/dashboard"
                  className="btn btn-ghost"
                >
                  My Learning →
                </a>
              </div>

              <div className="hero-mini">
                <div>
                  <strong>
                    Course
                  </strong>
                  <span>
                    Видео · Quiz · Progress
                  </span>
                </div>

                <div>
                  <strong>
                    Digital
                  </strong>
                  <span>
                    Ном · Материал
                  </span>
                </div>
              </div>

            </div>


            <div className="pass">

              <div className="pass-top">
                <div>
                  <div className="route">
                    LEARN
                    <span className="route-plane">
                      ✦
                    </span>
                    MINEA
                  </div>

                  <div className="pass-sub">
                    KOREAN LEARNING · STUDENT PASS
                  </div>
                </div>

                <div className="pass-stamp">
                  시작
                </div>
              </div>

              <div className="pass-row">
                <span>
                  Суралцагч
                </span>

                <b>
                  Таны нэр
                </b>
              </div>

              <div className="pass-row">
                <span>
                  Сургалт
                </span>

                <b>
                  Таны сонголт
                </b>
              </div>

              <div className="pass-row">
                <span>
                  Систем
                </span>

                <b>
                  Видео + Quiz
                </b>
              </div>

              <div className="pass-row">
                <span>
                  Ахиц
                </span>

                <b>
                  Progress tracking
                </b>
              </div>

              <div className="pass-bottom">
                START LEARNING →
              </div>

            </div>

          </div>
        </section>


        {/* NOTICE */}
        {notice && (
          <section className="notice-section">
            <div className="wrap">

              <div className="notice-card">
                <div>
                  <span className="tag">
                    UPDATE
                  </span>

                  <h2>
                    {notice.title}
                  </h2>

                  {notice.body && (
                    <p>
                      {notice.body}
                    </p>
                  )}
                </div>

                {notice.button_text &&
                  notice.button_url && (
                    <a
                      href={
                        notice.button_url
                      }
                      className="btn btn-primary"
                    >
                      {
                        notice.button_text
                      }
                    </a>
                  )}
              </div>

            </div>
          </section>
        )}


        {/* PRODUCTS */}
        <section
          className="products"
          id="products"
        >
          <div className="wrap">

            <div className="section-head">
              <span className="tag">
                01 · НОМ
              </span>

              <h2>
                Манай номууд
              </h2>

              <p>
                Солонгос хэл болон TOPIK
                суралцагчдад зориулсан,
                өөрийн хурдаар судлах
                боломжтой цахим материалууд.
              </p>
            </div>


            {loading ? (
              <div className="empty">
                Материал ачаалж байна...
              </div>
            ) : products.length === 0 ? (
              <div className="empty">
                Одоогоор материал
                нэмэгдээгүй байна.
              </div>
            ) : (
              <div className="book-grid">

                {products.map(
                  (product) => (
                    <article
                      className="book-card"
                      key={product.id}
                    >

                      {product.image_url ? (
                        <img
                          className="book-cover"
                          src={
                            product.image_url
                          }
                          alt={
                            product.title
                          }
                        />
                      ) : (
                        <div className="book-cover no-cover">
                          LEARN·MINEA
                        </div>
                      )}

                      <h3>
                        {product.title}
                      </h3>

                      <p>
                        {product.description ||
                          'LEARN·MINEA цахим сургалтын материал.'}
                      </p>

                      <div className="book-price">

                        <div>
                          {product.old_price && (
                            <del>
                              ₮
                              {Number(
                                product.old_price
                              ).toLocaleString()}
                            </del>
                          )}

                          <strong>
                            ₮
                            {Number(
                              product.price ||
                                0
                            ).toLocaleString()}
                          </strong>
                        </div>

                        {product.order_url ? (
                          <a
                            className="btn btn-ghost small-button"
                            target="_blank"
                            rel="noreferrer"
                            href={
                              product.order_url
                            }
                          >
                            Захиалах
                          </a>
                        ) : (
                          <span />
                        )}

                      </div>

                    </article>
                  )
                )}

              </div>
            )}

          </div>
        </section>


        {/* COURSES */}
        <section
          id="courses"
          className="courses"
        >
          <div className="wrap">

            <div className="section-head">

              <span className="tag">
                02 · СУРГАЛТ
              </span>

              <h2>
                Онлайн сургалтууд
              </h2>

              <p>
                Видео хичээл, quiz,
                progress tracking болон
                системтэй хичээлийн
                дараалалтай сургалтаас
                сонгоорой.
              </p>

            </div>


            {loading ? (
              <div className="empty">
                Сургалтууд ачаалж байна...
              </div>
            ) : courseCards.length === 0 ? (
              <div className="empty">
                Одоогоор сургалт
                нэмэгдээгүй байна.
              </div>
            ) : (
              <div className="course-grid">

                {courseCards.map(
                  (course, index) => (
                    <article
                      className="course-card"
                      key={course.id}
                    >

                      <div className="course-icon">
                        {String(
                          index + 1
                        ).padStart(
                          2,
                          '0'
                        )}
                      </div>

                      {course.level && (
                        <span className="course-level">
                          {course.level}
                        </span>
                      )}

                      <h3>
                        {course.title}
                      </h3>

                      <p>
                        {course.description ||
                          'LEARN·MINEA онлайн сургалт.'}
                      </p>


                      {course.lessons.length >
                        0 && (
                        <div className="lesson-list">

                          {course.lessons
                            .slice(0, 3)
                            .map(
                              (
                                lesson,
                                lessonIndex
                              ) => (
                                <div
                                  className="lesson-row"
                                  key={
                                    lesson.id
                                  }
                                >
                                  <span>
                                    {String(
                                      lessonIndex +
                                        1
                                    ).padStart(
                                      2,
                                      '0'
                                    )}
                                  </span>

                                  <p>
                                    {
                                      lesson.title
                                    }
                                  </p>
                                </div>
                              )
                            )}

                          {course.lessons
                            .length >
                            3 && (
                            <div className="more-lessons">
                              +
                              {course
                                .lessons
                                .length -
                                3}{' '}
                              хичээл
                            </div>
                          )}

                        </div>
                      )}


                      <div className="course-bottom">

                        {course.price ? (
                          <strong>
                            ₮
                            {Number(
                              course.price
                            ).toLocaleString()}
                          </strong>
                        ) : (
                          <span />
                        )}

                        <a
                          href="/login"
                          className="course-link"
                        >
                          Суралцах →
                        </a>

                      </div>

                    </article>
                  )
                )}

              </div>
            )}

          </div>
        </section>


        {/* PROCESS */}
        <section
          id="process"
          className="process"
        >
          <div className="wrap">

            <div className="section-head process-head">
              <div>
                <span className="tag">
                  03 · ЯВЦ
                </span>

                <h2>
                  Хэрхэн ажиллах вэ?
                </h2>

                <p>
                  Ном болон онлайн
                  сургалтын авах үйл явц
                  тусдаа.
                </p>
              </div>


              <div className="process-tabs">

                <button
                  type="button"
                  className={
                    processType ===
                    'course'
                      ? 'process-tab active'
                      : 'process-tab'
                  }
                  onClick={() =>
                    setProcessType(
                      'course'
                    )
                  }
                >
                  Онлайн сургалт
                </button>

                <button
                  type="button"
                  className={
                    processType ===
                    'book'
                      ? 'process-tab active'
                      : 'process-tab'
                  }
                  onClick={() =>
                    setProcessType(
                      'book'
                    )
                  }
                >
                  Цахим ном
                </button>

              </div>
            </div>


            <div className="process-grid">
              {activeSteps.map(
                (step) => (
                  <article
                    className="step"
                    key={step.number}
                  >
                    <div className="step-num">
                      {step.number}
                    </div>

                    <h3>
                      {step.title}
                    </h3>

                    <p>
                      {step.text}
                    </p>
                  </article>
                )
              )}
            </div>

          </div>
        </section>


        {/* CHOOSE TYPE */}
        <section className="choose-section">
          <div className="wrap">

            <div className="section-head">
              <span className="tag">
                04 · СОНГОЛТ
              </span>

              <h2>
                Өөрт тохирохоо сонгоорой
              </h2>

              <p>
                Бие даан материалаар
                сурах уу эсвэл хичээлийн
                системтэй сургалтаар
                сурах уу гэдгээ сонгоорой.
              </p>
            </div>


            <div className="choice-grid">

              <article className="ticket">

                <div className="ticket-top">
                  <span className="choice-label">
                    SELF STUDY
                  </span>

                  <div className="ticket-title">
                    Цахим ном, материал
                  </div>

                  <p>
                    Өөрийн хурдаар,
                    хүссэн үедээ судлах
                    материал.
                  </p>
                </div>

                <div className="ticket-line" />

                <ul>
                  <li>
                    Өөрийн хурдаар сурах
                  </li>

                  <li>
                    Утас, компьютерээс
                    ашиглах
                  </li>

                  <li>
                    Үг, дүрэм, TOPIK
                    материал
                  </li>
                </ul>

                <div className="ticket-footer">
                  <a
                    href="#products"
                    className="btn btn-primary"
                  >
                    Номууд үзэх
                  </a>
                </div>

              </article>


              <article className="ticket featured">

                <span className="popular">
                  SYSTEM LEARNING
                </span>

                <div className="ticket-top">
                  <span className="choice-label">
                    COURSE
                  </span>

                  <div className="ticket-title">
                    Онлайн сургалт
                  </div>

                  <p>
                    Хичээлийн дараалалтай,
                    progress хадгалагддаг
                    суралцах орчин.
                  </p>
                </div>

                <div className="ticket-line" />

                <ul>
                  <li>
                    Видео хичээл
                  </li>

                  <li>
                    Quiz
                  </li>

                  <li>
                    Progress tracking
                  </li>

                  <li>
                    Student Dashboard
                  </li>
                </ul>

                <div className="ticket-footer">
                  <a
                    href="#courses"
                    className="btn btn-primary"
                  >
                    Сургалтууд үзэх
                  </a>
                </div>

              </article>

            </div>

          </div>
        </section>


        {/* LEARNING STYLE */}
        <section
          id="learning-style"
          className="learning-section"
        >
          <div className="wrap">

            <div className="learning-box">

              <div>
                <span className="tag">
                  05 · СУРАХ АРГА БАРИЛ
                </span>

                <h2>
                  Танд тохирох сурах
                  аргаа олъё
                </h2>

                <p>
                  15–20 минутын
                  асуулгаар таны
                  зорилго, одоогийн
                  арга, боломжит
                  цагийг тодруулж,
                  тохирох сурах
                  чиглэлээ сонгоход
                  тусална.
                </p>
              </div>

              <a
                href={LEARNING_STYLE_URL}
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary learning-button"
              >
                Үнэлгээг эхлүүлэх →
              </a>

            </div>

          </div>
        </section>


        {/* STUDENT DASHBOARD */}
        <section className="dashboard-section">
          <div className="wrap">

            <div className="dashboard-box">

              <div className="dashboard-copy">
                <span className="tag dark-tag">
                  06 · MY LEARNING
                </span>

                <h2>
                  Сургалтаа нэг
                  газраас үргэлжлүүл.
                </h2>

                <p>
                  Хичээл, quiz,
                  ахиц болон сургалтын
                  эрхээ Student
                  Dashboard-аас
                  удирдана.
                </p>

                <div className="dashboard-actions">
                  <a
                    href="/dashboard"
                    className="btn btn-primary"
                  >
                    Student Dashboard →
                  </a>

                  <a
                    href="/login"
                    className="btn dashboard-login"
                  >
                    Нэвтрэх
                  </a>
                </div>
              </div>


              <div className="dashboard-preview">

                <div className="preview-head">
                  <span>
                    MY LEARNING
                  </span>

                  <b>
                    ACTIVE
                  </b>
                </div>

                <div className="preview-card">

                  <div className="preview-title">
                    <div>
                      <span>
                        CURRENT COURSE
                      </span>

                      <strong>
                        LEARN·MINEA
                      </strong>
                    </div>

                    <b>
                      68%
                    </b>
                  </div>

                  <div className="progress-track">
                    <div />
                  </div>

                  <div className="preview-next">
                    <span>
                      NEXT LESSON
                    </span>

                    <strong>
                      Үргэлжлүүлэн сурах →
                    </strong>
                  </div>

                </div>

              </div>

            </div>

          </div>
        </section>


        {/* FAQ */}
        <section
          id="faq"
          className="faq-section"
        >
          <div className="wrap">

            <div className="section-head">
              <span className="tag">
                07 · FAQ
              </span>

              <h2>
                Түгээмэл асуулт
              </h2>
            </div>


            <div className="faq-list">

              <details className="faq">
                <summary>
                  <span>
                    Онлайн сургалтад
                    хэрхэн бүртгүүлэх вэ?
                  </span>

                  <span className="faq-plus">
                    +
                  </span>
                </summary>

                <div className="faq-answer">
                  Account-аараа нэвтэрч
                  сургалтаа сонгоод
                  Payment хэсгээс
                  төлбөрийн хүсэлт болон
                  баримтаа илгээнэ.
                </div>
              </details>


              <details className="faq">
                <summary>
                  <span>
                    Төлбөр баталгаажсаны
                    дараа юу болох вэ?
                  </span>

                  <span className="faq-plus">
                    +
                  </span>
                </summary>

                <div className="faq-answer">
                  Төлбөр баталгаажсаны
                  дараа тухайн сургалтын
                  эрх таны account-д
                  нээгдэж Student
                  Dashboard-аас хичээлээ
                  үзэж эхэлнэ.
                </div>
              </details>


              <details className="faq">
                <summary>
                  <span>
                    Сургалтаа утаснаасаа
                    үзэж болох уу?
                  </span>

                  <span className="faq-plus">
                    +
                  </span>
                </summary>

                <div className="faq-answer">
                  Болно. LEARN·MINEA нь
                  утас, таблет болон
                  компьютерийн дэлгэцэнд
                  тохирсон responsive
                  байдлаар ажиллана.
                </div>
              </details>


              <details className="faq">
                <summary>
                  <span>
                    Хичээлийн progress
                    хадгалагдах уу?
                  </span>

                  <span className="faq-plus">
                    +
                  </span>
                </summary>

                <div className="faq-answer">
                  Тийм. Дуусгасан хичээл,
                  quiz-ийн үр дүн болон
                  сургалтын progress
                  таны account дээр
                  хадгалагдана.
                </div>
              </details>


              <details className="faq">
                <summary>
                  <span>
                    Quiz өгсний дараа
                    юу болох вэ?
                  </span>

                  <span className="faq-plus">
                    +
                  </span>
                </summary>

                <div className="faq-answer">
                  Quiz-ийн шаардлагатай
                  оноог авсан үед тухайн
                  lesson completed болж,
                  нийт сургалтын progress
                  шинэчлэгдэнэ.
                </div>
              </details>


              <details className="faq">
                <summary>
                  <span>
                    Цахим ном болон
                    онлайн сургалтын
                    ялгаа юу вэ?
                  </span>

                  <span className="faq-plus">
                    +
                  </span>
                </summary>

                <div className="faq-answer">
                  Цахим номыг өөрийн
                  хурдаар бие даан
                  ашиглана. Онлайн
                  сургалт нь lesson,
                  video, quiz болон
                  progress tracking бүхий
                  системтэй суралцах
                  орчин юм.
                </div>
              </details>

            </div>

          </div>
        </section>


        {/* FINAL CTA */}
        <div className="final-cta">

          <span>
            LEARN·MINEA
          </span>

          <h2>
            Өнөөдрөөс суралцаж
            эхлээрэй.
          </h2>

          <p>
            Өөрт тохирох сургалт
            эсвэл материалаа
            сонгоод эхэл.
          </p>

          <div className="final-buttons">
            <a
              href="#courses"
              className="btn final-button"
            >
              Сургалтууд үзэх
            </a>

            <a
              href="/dashboard"
              className="btn final-secondary"
            >
              My Learning →
            </a>
          </div>

        </div>


        {/* FOOTER */}
        <footer>
          <div className="wrap footer-inner">

            <div>
              <strong>
                LEARN
                <span className="purple">
                  ·
                </span>
                MINEA
              </strong>

              <p>
                Korean Learning Platform
              </p>
            </div>

            <div className="footer-links">
              <a href="#products">
                Ном
              </a>

              <a href="#courses">
                Сургалт
              </a>

              <a href="#faq">
                FAQ
              </a>

              <a href="/login">
                Login
              </a>
            </div>

            <div className="footer-email">
              learnwithminea@gmail.com
            </div>

          </div>
        </footer>

      </div>


      <style jsx>{`
        :global(*) {
          box-sizing: border-box;
        }

        :global(html) {
          scroll-behavior: smooth;
        }

        :global(body) {
          margin: 0;
          background: #f8f7ff;
          color: #232135;
          font-family:
            Arial,
            Helvetica,
            sans-serif;
        }

        .site {
          min-height: 100vh;
          overflow-x: hidden;
          background: #f8f7ff;

          --bg: #f8f7ff;
          --white: #ffffff;
          --text: #232135;
          --muted: #716d80;
          --line: #e8e4f2;
          --primary: #6c5ce7;
          --primary2: #8b7cf6;
          --soft: #eeeafe;
          --accent: #ff7e79;
        }

        a {
          color: inherit;
          text-decoration: none;
        }

        button {
          font: inherit;
        }

        .wrap {
          width: min(
            1180px,
            calc(100% - 40px)
          );

          margin: 0 auto;
        }

        .purple {
          color: var(--primary);
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;

          min-height: 46px;

          padding: 0 21px;

          border: 0;
          border-radius: 12px;

          font-size: 13px;
          font-weight: 800;

          cursor: pointer;

          transition: 0.2s;
        }

        .btn:hover {
          transform:
            translateY(-2px);
        }

        .btn-primary {
          color: #fff;

          background:
            linear-gradient(
              135deg,
              var(--primary),
              var(--primary2)
            );

          box-shadow:
            0 10px 24px
            rgba(
              108,
              92,
              231,
              0.2
            );
        }

        .btn-ghost {
          background: #fff;
          color: var(--text);

          border:
            1px solid
            var(--line);
        }


        /* HEADER */

        .header {
          position: sticky;
          top: 0;

          z-index: 100;

          background:
            rgba(
              248,
              247,
              255,
              0.9
            );

          backdrop-filter:
            blur(16px);

          border-bottom:
            1px solid
            var(--line);
        }

        .header-inner {
          height: 72px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 24px;
        }

        .logo {
          display: flex;
          align-items: center;

          gap: 10px;

          color: var(--text);

          font-size: 15px;
          font-weight: 900;

          letter-spacing:
            -0.3px;
        }

        .logo-mark {
          width: 38px;
          height: 38px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 12px;

          color: #fff;

          background:
            linear-gradient(
              135deg,
              var(--primary),
              var(--primary2)
            );

          font-size: 17px;
          font-weight: 900;
        }

        nav {
          display: flex;
          align-items: center;

          gap: 24px;

          color: var(--muted);

          font-size: 12px;
          font-weight: 700;
        }

        nav a:hover {
          color:
            var(--primary);
        }


        /* COMMON */

        section {
          padding: 84px 0;
        }

        .tag,
        .eyebrow {
          display: inline-flex;

          padding:
            8px 12px;

          border-radius:
            999px;

          color:
            var(--primary);

          background:
            var(--soft);

          font-size: 10px;
          font-weight: 900;

          letter-spacing:
            1.1px;
        }

        .section-head {
          max-width: 720px;
          margin-bottom: 38px;
        }

        .section-head h2 {
          margin:
            14px 0 12px;

          color: var(--text);

          font-size:
            clamp(
              32px,
              5vw,
              44px
            );

          line-height: 1.08;

          letter-spacing:
            -1.8px;
        }

        .section-head > p {
          margin: 0;

          color:
            var(--muted);

          font-size: 14px;
          line-height: 1.75;
        }

        .empty {
          padding: 40px;

          border:
            1px solid
            var(--line);

          border-radius: 20px;

          background: #fff;

          color:
            var(--muted);

          text-align: center;
        }


        /* HERO */

        .hero {
          padding:
            82px 0;

          background:
            radial-gradient(
              circle at 85% 10%,
              rgba(
                139,
                124,
                246,
                0.24
              ),
              transparent 30%
            ),
            linear-gradient(
              180deg,
              #fbfaff,
              #f7f5ff
            );

          border-bottom:
            1px solid
            var(--line);
        }

        .hero-grid {
          display: grid;

          grid-template-columns:
            1.1fr
            0.9fr;

          gap: 65px;

          align-items: center;
        }

        .eyebrow {
          margin-bottom: 20px;
        }

        .hero h1 {
          max-width: 700px;

          margin:
            0 0 20px;

          color:
            var(--text);

          font-size:
            clamp(
              43px,
              5vw,
              62px
            );

          line-height: 1.07;

          letter-spacing:
            -2.7px;
        }

        .lead {
          max-width: 620px;

          margin:
            0 0 28px;

          color:
            var(--muted);

          font-size: 16px;
          line-height: 1.8;
        }

        .hero-buttons {
          display: flex;
          flex-wrap: wrap;

          gap: 12px;

          margin-bottom: 32px;
        }

        .hero-mini {
          display: flex;
          flex-wrap: wrap;

          gap: 28px;
        }

        .hero-mini div {
          display: flex;
          flex-direction: column;

          gap: 4px;
        }

        .hero-mini strong {
          font-size: 13px;
        }

        .hero-mini span {
          color:
            var(--muted);

          font-size: 11px;
        }


        /* PASS */

        .pass {
          position: relative;

          padding: 30px;

          border:
            1px solid
            #ece7f2;

          border-radius: 12px;

          background:
            #fffdfc;

          box-shadow:
            0 28px 70px
            rgba(
              67,
              53,
              128,
              0.18
            );

          transform:
            rotate(2deg);
        }

        .pass::before,
        .pass::after {
          content: '';

          position: absolute;

          top: 50%;

          width: 27px;
          height: 27px;

          border-radius: 50%;

          background:
            #f6f4ff;

          transform:
            translateY(-50%);
        }

        .pass::before {
          left: -14px;
        }

        .pass::after {
          right: -14px;
        }

        .pass-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;

          gap: 20px;

          padding-bottom: 18px;
          margin-bottom: 17px;

          border-bottom:
            2px dashed
            #ddd7e8;
        }

        .route {
          color: var(--text);

          font-size: 24px;
          font-weight: 900;
        }

        .route-plane {
          margin:
            0 7px;

          color:
            var(--accent);
        }

        .pass-sub {
          margin-top: 6px;

          color: #777080;

          font-size: 9px;
          font-weight: 800;

          letter-spacing:
            1.1px;
        }

        .pass-stamp {
          padding:
            6px 9px;

          color:
            var(--accent);

          border:
            2px solid
            var(--accent);

          border-radius: 6px;

          font-weight: 900;

          transform:
            rotate(-7deg);
        }

        .pass-row {
          display: flex;
          justify-content: space-between;

          gap: 20px;

          margin: 12px 0;

          color:
            #777080;

          font-size: 12px;
        }

        .pass-row b {
          color:
            var(--text);
        }

        .pass-bottom {
          margin-top: 20px;
          padding-top: 18px;

          border-top:
            2px dashed
            #ddd7e8;

          color:
            var(--primary);

          font-size: 12px;
          font-weight: 900;
        }


        /* NOTICE */

        .notice-section {
          padding:
            35px 0 0;
        }

        .notice-card {
          padding: 30px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 30px;

          border:
            1px solid
            #e4defa;

          border-radius: 22px;

          background:
            linear-gradient(
              135deg,
              #fbfaff,
              #f4f1ff
            );
        }

        .notice-card h2 {
          margin:
            12px 0 8px;

          font-size: 25px;
        }

        .notice-card p {
          margin: 0;

          color:
            var(--muted);

          line-height: 1.7;
        }


        /* BOOKS */

        .products {
          background: #fff;

          border-top:
            1px solid
            var(--line);

          border-bottom:
            1px solid
            var(--line);
        }

        .book-grid {
          display: grid;

          grid-template-columns:
            repeat(
              4,
              minmax(
                0,
                1fr
              )
            );

          gap: 18px;
        }

        .book-card {
          min-width: 0;

          padding: 20px;

          display: flex;
          flex-direction: column;

          border:
            1px solid
            var(--line);

          border-radius: 20px;

          background: #fff;

          box-shadow:
            0 10px 30px
            rgba(
              63,
              49,
              122,
              0.05
            );
        }

        .book-cover {
          width: 100%;

          aspect-ratio:
            3 / 4;

          display: block;

          margin-bottom: 18px;

          object-fit: cover;

          border:
            1px solid
            var(--line);

          border-radius: 16px;
        }

        .no-cover {
          display: flex;
          align-items: center;
          justify-content: center;

          background:
            var(--soft);

          color:
            var(--primary);

          font-weight: 900;
        }

        .book-card h3 {
          margin:
            0 0 10px;

          min-height: 45px;

          color:
            var(--text);

          font-size: 17px;
          line-height: 1.35;
        }

        .book-card > p {
          min-height: 92px;

          margin: 0;

          color:
            var(--muted);

          font-size: 13px;
          line-height: 1.7;
        }

        .book-price {
          margin-top: auto;

          padding-top: 17px;

          display: flex;
          align-items: flex-end;
          justify-content: space-between;

          gap: 10px;

          border-top:
            1px solid
            var(--line);
        }

        .book-price > div {
          display: flex;
          flex-direction: column;

          gap: 4px;
        }

        .book-price strong {
          color:
            var(--primary);

          font-size: 17px;
          font-weight: 900;
        }

        .book-price del {
          color: #aaa6b3;

          font-size: 11px;
        }

        .small-button {
          min-height: 40px;

          padding:
            0 14px;
        }


        /* COURSES */

        .courses {
          background:
            var(--bg);
        }

        .course-grid {
          display: grid;

          grid-template-columns:
            repeat(
              3,
              minmax(
                0,
                1fr
              )
            );

          gap: 18px;
        }

        .course-card {
          min-width: 0;

          padding: 25px;

          display: flex;
          flex-direction: column;

          border:
            1px solid
            var(--line);

          border-radius: 20px;

          background: #fff;
        }

        .course-icon {
          width: 48px;
          height: 48px;

          display: flex;
          align-items: center;
          justify-content: center;

          margin-bottom: 15px;

          border-radius: 14px;

          background:
            var(--soft);

          color:
            var(--primary);

          font-size: 13px;
          font-weight: 900;
        }

        .course-level {
          width: max-content;

          margin-bottom: 10px;

          padding:
            5px 8px;

          border-radius:
            999px;

          background:
            #f4f2fd;

          color:
            var(--primary);

          font-size: 9px;
          font-weight: 900;
        }

        .course-card h3 {
          margin:
            0 0 10px;

          color:
            var(--text);

          font-size: 20px;
        }

        .course-card > p {
          margin: 0;

          color:
            var(--muted);

          font-size: 13px;
          line-height: 1.7;
        }

        .lesson-list {
          margin-top: 18px;

          padding-top: 14px;

          border-top:
            1px solid
            var(--line);
        }

        .lesson-row {
          padding:
            7px 0;

          display: flex;
          align-items: center;

          gap: 10px;
        }

        .lesson-row > span {
          width: 27px;
          height: 27px;

          flex:
            0 0 27px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 8px;

          background:
            var(--soft);

          color:
            var(--primary);

          font-size: 8px;
          font-weight: 900;
        }

        .lesson-row p {
          margin: 0;

          color:
            #565261;

          font-size: 11px;
        }

        .more-lessons {
          margin-top: 6px;

          color:
            var(--muted);

          font-size: 10px;
        }

        .course-bottom {
          margin-top: auto;

          padding-top: 20px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 15px;
        }

        .course-bottom > strong {
          color:
            var(--primary);

          font-size: 17px;
        }

        .course-link {
          color:
            var(--primary);

          font-size: 12px;
          font-weight: 900;
        }


        /* PROCESS */

        .process {
          background:
            linear-gradient(
              180deg,
              #f9f8ff,
              #f4f1ff
            );
        }

        .process-head {
          max-width: none;

          display: flex;
          align-items: flex-end;
          justify-content: space-between;

          gap: 30px;
        }

        .process-head > div:first-child {
          max-width: 650px;
        }

        .process-tabs {
          padding: 4px;

          display: flex;

          gap: 4px;

          border:
            1px solid
            var(--line);

          border-radius: 12px;

          background: #fff;
        }

        .process-tab {
          border: 0;

          padding:
            11px 15px;

          border-radius: 9px;

          background:
            transparent;

          color:
            var(--muted);

          font-size: 11px;
          font-weight: 800;

          cursor: pointer;
        }

        .process-tab.active {
          background:
            var(--primary);

          color: #fff;
        }

        .process-grid {
          display: grid;

          grid-template-columns:
            repeat(
              4,
              minmax(
                0,
                1fr
              )
            );

          gap: 16px;
        }

        .step {
          padding: 25px;

          border:
            1px solid
            var(--line);

          border-radius: 18px;

          background: #fff;
        }

        .step-num {
          width: 44px;
          height: 44px;

          display: flex;
          align-items: center;
          justify-content: center;

          margin-bottom: 18px;

          border-radius: 12px;

          background:
            var(--soft);

          color:
            var(--primary);

          font-size: 13px;
          font-weight: 900;
        }

        .step h3 {
          margin:
            0 0 9px;

          font-size: 17px;
        }

        .step p {
          margin: 0;

          color:
            var(--muted);

          font-size: 13px;
          line-height: 1.7;
        }


        /* CHOOSE */

        .choose-section {
          background:
            linear-gradient(
              180deg,
              #f6f3ff,
              #fbfaff
            );
        }

        .choice-grid {
          max-width: 900px;

          display: grid;

          grid-template-columns:
            repeat(
              2,
              minmax(
                0,
                1fr
              )
            );

          gap: 24px;
        }

        .ticket {
          position: relative;

          overflow: hidden;

          display: flex;
          flex-direction: column;

          border:
            1px solid
            #eae5f0;

          border-radius: 10px;

          background:
            #fffdfc;

          box-shadow:
            0 18px 45px
            rgba(
              63,
              49,
              122,
              0.08
            );
        }

        .ticket.featured {
          outline:
            2px solid
            var(--primary);
        }

        .ticket-top {
          padding:
            27px 24px 20px;
        }

        .choice-label {
          display: block;

          margin-bottom: 11px;

          color:
            var(--primary);

          font-size: 9px;
          font-weight: 900;

          letter-spacing:
            1.2px;
        }

        .ticket-title {
          margin-bottom: 10px;

          font-size: 20px;
          font-weight: 900;
        }

        .ticket-top p {
          margin: 0;

          color:
            var(--muted);

          font-size: 13px;
          line-height: 1.7;
        }

        .ticket-line {
          border-top:
            2px dashed
            #ddd7e8;
        }

        .ticket ul {
          flex: 1;

          margin: 0;

          padding:
            22px 24px;

          display: grid;

          gap: 11px;

          list-style: none;

          font-size: 13px;
        }

        .ticket li::before {
          content: '✓';

          margin-right: 9px;

          color:
            var(--primary);

          font-weight: 900;
        }

        .ticket-footer {
          padding:
            18px 24px 26px;
        }

        .ticket-footer .btn {
          width: 100%;
        }

        .popular {
          position: absolute;

          right: 14px;
          top: 14px;

          padding:
            5px 9px;

          border-radius:
            999px;

          background:
            var(--primary);

          color: #fff;

          font-size: 8px;
          font-weight: 900;
        }


        /* LEARNING STYLE */

        .learning-section {
          background: #fff;
        }

        .learning-box {
          padding: 42px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 35px;

          border:
            1px solid
            var(--line);

          border-radius: 24px;

          background: #fff;

          box-shadow:
            0 18px 50px
            rgba(
              71,
              54,
              145,
              0.1
            );
        }

        .learning-box h2 {
          margin:
            13px 0 10px;

          max-width: 600px;

          font-size:
            clamp(
              30px,
              4vw,
              42px
            );

          letter-spacing:
            -1.5px;
        }

        .learning-box p {
          max-width: 700px;

          margin: 0;

          color:
            var(--muted);

          font-size: 14px;
          line-height: 1.75;
        }

        .learning-button {
          flex: 0 0 auto;
        }


        /* DASHBOARD */

        .dashboard-section {
          background:
            var(--bg);
        }

        .dashboard-box {
          padding: 48px;

          display: grid;

          grid-template-columns:
            minmax(0, 1fr)
            minmax(
              320px,
              430px
            );

          gap: 55px;

          align-items: center;

          overflow: hidden;

          border-radius: 27px;

          background:
            #2c293b;
        }

        .dark-tag {
          background:
            rgba(
              255,
              255,
              255,
              0.09
            );

          color:
            #bcb2ff;
        }

        .dashboard-copy h2 {
          max-width: 550px;

          margin:
            14px 0;

          color: #fff;

          font-size:
            clamp(
              33px,
              5vw,
              45px
            );

          line-height: 1.08;

          letter-spacing:
            -1.7px;
        }

        .dashboard-copy p {
          max-width: 520px;

          margin: 0;

          color:
            #bbb6c7;

          font-size: 14px;
          line-height: 1.75;
        }

        .dashboard-actions {
          margin-top: 26px;

          display: flex;
          flex-wrap: wrap;

          gap: 10px;
        }

        .dashboard-login {
          color: #fff;

          border:
            1px solid
            #5e596d;

          background:
            transparent;
        }

        .dashboard-preview {
          padding: 20px;

          border-radius: 19px;

          background: #fff;
        }

        .preview-head {
          display: flex;
          align-items: center;
          justify-content: space-between;

          margin-bottom: 15px;

          color:
            #9995a2;

          font-size: 8px;
          font-weight: 900;

          letter-spacing:
            1.2px;
        }

        .preview-head b {
          color:
            #27814b;
        }

        .preview-card {
          padding: 19px;

          border-radius: 15px;

          background:
            #f8f7ff;
        }

        .preview-title {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;

          gap: 15px;
        }

        .preview-title div {
          display: flex;
          flex-direction: column;

          gap: 5px;
        }

        .preview-title span,
        .preview-next span {
          color:
            #a09ca9;

          font-size: 8px;
          font-weight: 900;

          letter-spacing:
            1px;
        }

        .preview-title strong {
          font-size: 15px;
        }

        .preview-title > b {
          color:
            var(--primary);
        }

        .progress-track {
          height: 8px;

          margin:
            18px 0;

          overflow: hidden;

          border-radius:
            999px;

          background:
            #e7e3f2;
        }

        .progress-track div {
          width: 68%;
          height: 100%;

          border-radius: inherit;

          background:
            var(--primary);
        }

        .preview-next {
          padding-top: 15px;

          display: flex;
          flex-direction: column;

          gap: 5px;

          border-top:
            1px solid
            #e5e1ec;
        }

        .preview-next strong {
          color:
            var(--primary);

          font-size: 11px;
        }


        /* FAQ */

        .faq-section {
          background: #fff;
        }

        .faq-list {
          display: grid;

          gap: 12px;
        }

        .faq {
          overflow: hidden;

          border:
            1px solid
            var(--line);

          border-radius: 16px;

          background: #fff;
        }

        .faq summary {
          list-style: none;

          padding:
            20px 22px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 20px;

          cursor: pointer;

          font-size: 14px;
          font-weight: 850;
        }

        .faq summary::-webkit-details-marker {
          display: none;
        }

        .faq-plus {
          width: 30px;
          height: 30px;

          flex:
            0 0 30px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;

          background:
            var(--soft);

          color:
            var(--primary);

          font-size: 20px;

          transition:
            0.2s;
        }

        .faq[open] .faq-plus {
          transform:
            rotate(45deg);
        }

        .faq-answer {
          padding:
            0 22px 20px;

          color:
            var(--muted);

          font-size: 13px;
          line-height: 1.8;
        }


        /* FINAL */

        .final-cta {
          width:
            min(
              1120px,
              calc(
                100% - 40px
              )
            );

          margin:
            25px auto 80px;

          padding:
            65px 30px;

          text-align: center;

          border-radius: 28px;

          color: #fff;

          background:
            linear-gradient(
              135deg,
              var(--primary),
              var(--primary2)
            );
        }

        .final-cta > span {
          font-size: 10px;
          font-weight: 900;

          letter-spacing:
            1.5px;
        }

        .final-cta h2 {
          margin:
            13px 0 11px;

          font-size:
            clamp(
              31px,
              5vw,
              43px
            );

          letter-spacing:
            -1.7px;
        }

        .final-cta p {
          margin:
            0 0 26px;

          color:
            rgba(
              255,
              255,
              255,
              0.8
            );
        }

        .final-buttons {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;

          gap: 10px;
        }

        .final-button {
          background: #fff;

          color:
            var(--primary);
        }

        .final-secondary {
          color: #fff;

          border:
            1px solid
            rgba(
              255,
              255,
              255,
              0.35
            );

          background:
            transparent;
        }


        /* FOOTER */

        footer {
          padding:
            38px 0;

          background:
            #f7f5fc;

          border-top:
            1px solid
            var(--line);
        }

        .footer-inner {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;

          gap: 25px;

          flex-wrap: wrap;
        }

        .footer-inner strong {
          font-size: 14px;
        }

        .footer-inner p {
          margin:
            5px 0 0;

          color:
            var(--muted);

          font-size: 10px;
        }

        .footer-links {
          display: flex;
          flex-wrap: wrap;

          gap: 18px;

          color:
            var(--muted);

          font-size: 11px;
          font-weight: 700;
        }

        .footer-email {
          color:
            var(--muted);

          font-size: 11px;
        }


        /* TABLET */

        @media (
          max-width: 950px
        ) {
          nav {
            display: none;
          }

          .hero-grid {
            grid-template-columns:
              1fr;
          }

          .pass {
            max-width: 600px;

            transform: none;
          }

          .book-grid {
            grid-template-columns:
              repeat(
                2,
                minmax(
                  0,
                  1fr
                )
              );
          }

          .course-grid {
            grid-template-columns:
              repeat(
                2,
                minmax(
                  0,
                  1fr
                )
              );
          }

          .process-grid {
            grid-template-columns:
              repeat(
                2,
                minmax(
                  0,
                  1fr
                )
              );
          }

          .dashboard-box {
            grid-template-columns:
              1fr;
          }
        }


        /* MOBILE */

        @media (
          max-width: 650px
        ) {
          .wrap {
            width:
              calc(
                100% - 28px
              );
          }

          section {
            padding:
              64px 0;
          }

          .header-inner {
            height: 64px;
          }

          .header-button {
            padding:
              0 13px;

            min-height: 40px;

            font-size: 10px;
          }

          .logo-mark {
            width: 34px;
            height: 34px;
          }

          .logo {
            font-size: 13px;
          }

          .hero {
            padding:
              54px 0 60px;
          }

          .hero-grid {
            gap: 38px;
          }

          .hero h1 {
            font-size: 40px;

            letter-spacing:
              -1.6px;
          }

          .lead {
            font-size: 14px;
          }

          .hero-buttons {
            display: grid;

            grid-template-columns:
              1fr;
          }

          .hero-buttons .btn {
            width: 100%;
          }

          .hero-mini {
            gap: 20px;
          }

          .pass {
            padding: 23px;
          }

          .pass-top {
            align-items: flex-start;
          }

          .route {
            font-size: 19px;
          }

          .pass-row {
            font-size: 10px;
          }

          .notice-card {
            padding: 22px;

            flex-direction: column;
            align-items: flex-start;
          }

          .book-grid,
          .course-grid,
          .process-grid,
          .choice-grid {
            grid-template-columns:
              1fr;
          }

          .book-card h3,
          .book-card > p {
            min-height: 0;
          }

          .book-cover {
            aspect-ratio:
              4 / 5;
          }

          .process-head {
            align-items: flex-start;
            flex-direction: column;
          }

          .process-tabs {
            width: 100%;

            display: grid;

            grid-template-columns:
              1fr 1fr;
          }

          .learning-box {
            padding: 27px 22px;

            flex-direction: column;
            align-items: flex-start;
          }

          .learning-button {
            width: 100%;
          }

          .dashboard-box {
            padding:
              30px 21px;

            gap: 35px;

            border-radius: 20px;
          }

          .dashboard-actions {
            display: grid;

            grid-template-columns:
              1fr;
          }

          .dashboard-actions .btn {
            width: 100%;
          }

          .dashboard-preview {
            padding: 14px;
          }

          .final-cta {
            width:
              calc(
                100% - 28px
              );

            margin-bottom:
              55px;

            padding:
              48px 20px;

            border-radius:
              20px;
          }

          .final-buttons {
            display: grid;

            grid-template-columns:
              1fr;
          }

          .footer-inner {
            flex-direction: column;
          }
        }
      `}</style>
    </>
  )
}
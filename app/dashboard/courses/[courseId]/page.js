"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

export default function StudentCoursePage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params?.courseId;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [accessDenied, setAccessDenied] = useState(false);
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [progress, setProgress] = useState([]);

  const loadPage = useCallback(async () => {
    if (!courseId) return;

    setLoading(true);
    setError("");
    setAccessDenied(false);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.replace("/login");
        return;
      }

      const { data: allowed, error: accessError } =
        await supabase.rpc("has_course_access", {
          target_course_id: courseId,
        });

      if (accessError) throw accessError;

      if (allowed !== true) {
        setAccessDenied(true);
        setCourse(null);
        setModules([]);
        setLessons([]);
        setProgress([]);
        return;
      }

      const { data: courseData, error: courseError } =
        await supabase
          .from("courses")
          .select("*")
          .eq("id", courseId)
          .single();

      if (courseError) throw courseError;

      const { data: moduleData, error: moduleError } =
        await supabase
          .from("modules")
          .select("*")
          .eq("course_id", courseId)
          .order("position", { ascending: true });

      if (moduleError) throw moduleError;

      const moduleIds = (moduleData || []).map(
        (item) => item.id
      );

      let lessonData = [];

      if (moduleIds.length > 0) {
        const { data, error: lessonError } =
          await supabase
            .from("lessons")
            .select("*")
            .in("module_id", moduleIds)
            .order("position", { ascending: true });

        if (lessonError) throw lessonError;

        lessonData = data || [];
      }

      let progressData = [];

      if (lessonData.length > 0) {
        const { data, error: progressError } =
          await supabase
            .from("lesson_progress")
            .select("lesson_id,completed")
            .eq("user_id", user.id)
            .in(
              "lesson_id",
              lessonData.map((item) => item.id)
            );

        if (progressError) throw progressError;

        progressData = data || [];
      }

      const { data: stillAllowed, error: recheckError } =
        await supabase.rpc("has_course_access", {
          target_course_id: courseId,
        });

      if (recheckError) throw recheckError;

      if (stillAllowed !== true) {
        setAccessDenied(true);
        setCourse(null);
        setModules([]);
        setLessons([]);
        setProgress([]);
        return;
      }

      setCourse(courseData);
      setModules(moduleData || []);
      setLessons(lessonData);
      setProgress(progressData);
    } catch (err) {
  const message =
    err?.message ||
    err?.details ||
    (typeof err === "string" ? err : JSON.stringify(err));

  setError(
    `Сургалт ачаалж чадсангүй: ${message || "Тодорхойгүй алдаа"}`
  );
} finally {
      setLoading(false);
    }
  }, [courseId, router]);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  const completedIds = useMemo(
    () =>
      new Set(
        progress
          .filter((item) => item.completed === true)
          .map((item) => item.lesson_id)
      ),
    [progress]
  );

  const completionPercentage = lessons.length
    ? Math.round(
        (lessons.filter((item) =>
          completedIds.has(item.id)
        ).length /
          lessons.length) *
          100
      )
    : 0;

    async function openLesson(lessonId) {
    try {
      const { data: allowed, error: accessError } =
        await supabase.rpc("has_course_access", {
          target_course_id: courseId,
        });

      if (accessError) throw accessError;

      if (allowed !== true) {
        setAccessDenied(true);
        return;
      }

      router.push(
        `/dashboard/courses/${courseId}/lessons/${lessonId}`
      );
    } catch (error) {
      const message =
        error?.message ||
        error?.details ||
        "Хичээл нээхэд алдаа гарлаа.";

      alert(message);
    }
  }

  if (loading) {
    return (
      <main className="page">
        <p>Сургалт ачаалж байна...</p>
        <style jsx>{styles}</style>
      </main>
    );
  }

  if (accessDenied) {
    return (
      <main className="page">
        <div className="card denied">
          <div className="emoji">🔒</div>
          <h1>Сургалтын эрх идэвхгүй байна</h1>
          <p>
            Таны энэ сургалтад хандах эрх байхгүй эсвэл
            цуцлагдсан байна.
          </p>
          <button
            className="primary"
            onClick={() =>
              router.push("/dashboard/payments")
            }
          >
            Төлбөрийн хэсэг рүү очих →
          </button>
        </div>
        <style jsx>{styles}</style>
      </main>
    );
  }

  if (error) {
    return (
      <main className="page">
        <div className="card denied">
          <h2>Сургалт ачаалж чадсангүй</h2>
          <p>{error}</p>
          <button className="primary" onClick={loadPage}>
            Дахин оролдох
          </button>
        </div>
        <style jsx>{styles}</style>
      </main>
    );
  }

  if (!course) return null;

  return (
    <main className="page">
      <button
        className="back"
        onClick={() => router.push("/dashboard")}
      >
        ← Миний сургалтууд
      </button>

      <section className="hero">
        <span className="eyebrow">LEARN·MINEA COURSE</span>
        <h1>{course.title}</h1>

        {course.description && (
          <p>{course.description}</p>
        )}

        <div className="progress-heading">
          <span>Сургалтын явц</span>
          <strong>{completionPercentage}%</strong>
        </div>

        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>

        <div className="stats">
          {modules.length} модуль · {lessons.length} хичээл ·{" "}
          {completedIds.size} дуусгасан
        </div>
      </section>

      <div className="section-heading">
        <h2>Сургалтын хөтөлбөр</h2>
        <p>Хичээлээ сонгоод үргэлжлүүлээрэй.</p>
      </div>

      {modules.length === 0 ? (
        <div className="card">
          Одоогоор сургалтын хичээл нэмэгдээгүй байна.
        </div>
      ) : (
        <div className="modules">
          {modules.map((module, moduleIndex) => {
            const moduleLessons = lessons.filter(
              (item) => item.module_id === module.id
            );

            return (
              <section className="card" key={module.id}>
                <div className="module-header">
                  <div className="module-number">
                    {String(moduleIndex + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <h3>{module.title}</h3>
                    {module.description && (
                      <p>{module.description}</p>
                    )}
                    <small>
                      {moduleLessons.length} хичээл
                    </small>
                  </div>
                </div>

                {moduleLessons.length === 0 ? (
                  <p className="empty">
                    Энэ модульд хичээл нэмэгдээгүй байна.
                  </p>
                ) : (
                  <div className="lesson-list">
                    {moduleLessons.map((lesson, index) => {
                      const done = completedIds.has(lesson.id);

                      return (
                        <button
                          key={lesson.id}
                          className="lesson"
                          onClick={() => openLesson(lesson.id)}
                        >
                          <div className="lesson-index">
                            {done ? "✓" : index + 1}
                          </div>

                          <div className="lesson-info">
                            <strong>{lesson.title}</strong>
                            {lesson.description && (
                              <span>{lesson.description}</span>
                            )}
                          </div>

                          <span
                            className={
                              done ? "status done" : "status"
                            }
                          >
                            {done ? "Дууссан" : "Үзэх →"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}

      <style jsx>{styles}</style>
    </main>
  );
}

const styles = `
  .page {
    width: 100%;
    max-width: 1020px;
    padding: 38px 30px 100px;
    color: #302A42;
  }

  .back {
    background: transparent;
    border: none;
    padding: 0;
    margin-bottom: 26px;
    color: #817991;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
  }

  .hero {
    background: linear-gradient(135deg, #F2EFFF, #FFFFFF);
    border: 1px solid #E8E2F8;
    border-radius: 24px;
    padding: 38px;
    margin-bottom: 36px;
  }

  .eyebrow {
    color: #0879D1;
    font-size: 11px;
    font-weight: 900;
    letter-spacing: 0.13em;
  }

  h1 {
    margin: 14px 0;
    font-size: clamp(27px, 4vw, 40px);
    letter-spacing: -0.04em;
  }

  .hero p {
    color: #817991;
    font-size: 14px;
    line-height: 1.8;
  }

  .progress-heading {
    display: flex;
    justify-content: space-between;
    margin-top: 30px;
    margin-bottom: 10px;
    font-size: 13px;
    font-weight: 700;
  }

  .progress-heading strong {
    color: #0879D1;
  }

  .progress-track {
    height: 9px;
    background: #E8E2F8;
    border-radius: 999px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: #0879D1;
    border-radius: 999px;
  }

  .stats {
    margin-top: 13px;
    color: #938BA2;
    font-size: 12px;
  }

  .section-heading {
    margin-bottom: 22px;
  }

  .section-heading h2 {
    margin: 0 0 7px;
    font-size: 23px;
  }

  .section-heading p {
    margin: 0;
    color: #938BA2;
    font-size: 13px;
  }

  .modules {
    display: grid;
    gap: 18px;
  }

  .card {
    background: white;
    border: 1px solid #E8E2F8;
    border-radius: 20px;
    padding: 26px;
  }

  .module-header {
    display: flex;
    align-items: flex-start;
    gap: 17px;
  }

  .module-number {
    display: grid;
    place-items: center;
    width: 48px;
    height: 48px;
    flex-shrink: 0;
    background: #F0EDFF;
    border-radius: 13px;
    color: #0879D1;
    font-weight: 900;
  }

  .module-header h3 {
    margin: 0 0 8px;
    font-size: 18px;
  }

  .module-header p {
    color: #817991;
    margin: 0 0 9px;
    font-size: 13px;
  }

  .module-header small {
    color: #A39BAD;
  }

  .lesson-list {
    margin-top: 22px;
    border-top: 1px solid #F0EDF7;
  }

  .lesson {
    display: flex;
    width: 100%;
    align-items: center;
    gap: 15px;
    padding: 18px 0;
    background: transparent;
    border: none;
    border-bottom: 1px solid #F0EDF7;
    text-align: left;
    cursor: pointer;
  }

  .lesson-index {
    width: 35px;
    height: 35px;
    flex-shrink: 0;
    display: grid;
    place-items: center;
    border-radius: 10px;
    background: #F0EDFF;
    color: #0879D1;
    font-size: 12px;
    font-weight: 800;
  }

  .lesson-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .lesson-info strong {
    color: #302A42;
    font-size: 14px;
  }

  .lesson-info span {
    color: #938BA2;
    font-size: 12px;
    line-height: 1.5;
  }

  .status {
    color: #0879D1;
    font-size: 12px;
    font-weight: 800;
    white-space: nowrap;
  }

  .status.done {
    color: #2E9660;
  }

  .empty {
    margin: 20px 0 0;
    color: #938BA2;
    font-size: 13px;
  }

  .denied {
    max-width: 560px;
    margin: 50px auto;
    text-align: center;
    padding: 50px 30px;
  }

  .denied .emoji {
    font-size: 44px;
  }

  .denied p {
    color: #817991;
    line-height: 1.8;
  }

  .primary {
    margin-top: 15px;
    padding: 14px 22px;
    background: #0879D1;
    color: white;
    border: none;
    border-radius: 11px;
    font-weight: 800;
    cursor: pointer;
  }

  @media (max-width: 650px) {
    .page {
      padding: 25px 16px 80px;
    }

    .hero {
      padding: 25px 20px;
    }

    .card {
      padding: 20px;
    }

    .lesson {
      gap: 10px;
    }

    .status {
      font-size: 11px;
    }
  }
`;
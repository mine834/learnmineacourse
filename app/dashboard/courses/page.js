"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function CoursesPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [courses, setCourses] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState([]);

  useEffect(() => {
    let active = true;

    async function loadCourses() {
      try {
        setLoading(true);
        setError("");

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          router.replace("/login");
          return;
        }

        const { data: courseData, error: courseError } =
          await supabase
            .from("courses")
            .select("*")
            .order("created_at", { ascending: false });

        if (courseError) throw courseError;

        const { data: enrollmentData, error: enrollmentError } =
          await supabase
            .from("enrollments")
            .select("course_id")
            .eq("user_id", user.id);

        if (enrollmentError) throw enrollmentError;

        if (!active) return;

        setCourses(courseData || []);
        setEnrolledIds(
          (enrollmentData || []).map((item) => item.course_id)
        );
      } catch (err) {
        if (active) {
          setError(
            err?.message || "Сургалтуудыг ачаалж чадсангүй."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadCourses();

    return () => {
      active = false;
    };
  }, [router]);

  return (
    <main className="courses-page">
      <div className="heading">
        <span className="eyebrow">LEARN·MINEA COURSES</span>
        <h1>Сургалтууд</h1>
        <p>
          Сургалтын эрхээ шалгаж, хичээлээ үргэлжлүүлээрэй.
        </p>
      </div>

      {loading ? (
        <div className="message">Сургалтууд ачаалж байна...</div>
      ) : error ? (
        <div className="message">{error}</div>
      ) : courses.length === 0 ? (
        <div className="message">
          Одоогоор сургалт нэмэгдээгүй байна.
        </div>
      ) : (
        <div className="course-grid">
          {courses.map((course) => {
            const hasAccess = enrolledIds.includes(course.id);

            return (
              <article className="course-card" key={course.id}>
                <div className="course-icon">
                  {hasAccess ? "✦" : "🔒"}
                </div>

                <span className="course-label">
                  LEARN·MINEA COURSE
                </span>

                <h2>{course.title}</h2>

                {course.description && (
                  <p className="description">
                    {course.description}
                  </p>
                )}

                <div className="course-footer">
                  <span
                    className={
                      hasAccess ? "status active" : "status inactive"
                    }
                  >
                    {hasAccess
                      ? "✓ Сургалтын эрх идэвхтэй"
                      : "🔒 Сургалтын эрх идэвхгүй байна"}
                  </span>

                  <button
                    onClick={() => {
                      if (hasAccess) {
                        router.push(
                          `/dashboard/courses/${course.id}`
                        );
                      } else {
                        router.push("/dashboard/payments");
                      }
                    }}
                  >
                    {hasAccess
                      ? "Хичээл үзэх →"
                      : "Эрх авах →"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <style jsx>{`
        .courses-page {
          max-width: 1100px;
          padding: 45px 35px 100px;
          color: #302a42;
        }

        .heading {
          margin-bottom: 35px;
        }

        .eyebrow,
        .course-label {
          color: #0879D1;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.14em;
        }

        h1 {
          margin: 12px 0;
          font-size: 36px;
          letter-spacing: -0.04em;
        }

        .heading p {
          color: #938ba2;
          font-size: 14px;
          line-height: 1.7;
        }

        .course-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 20px;
        }

        .course-card {
          display: flex;
          flex-direction: column;
          min-height: 290px;
          padding: 30px;
          border: 1px solid #e8e2f8;
          border-radius: 22px;
          background: #ffffff;
        }

        .course-icon {
          display: grid;
          place-items: center;
          width: 52px;
          height: 52px;
          margin-bottom: 24px;
          border-radius: 15px;
          background: #f0edff;
          color: #0879D1;
          font-size: 24px;
        }

        h2 {
          margin: 12px 0;
          font-size: 23px;
          letter-spacing: -0.025em;
        }

        .description {
          color: #938ba2;
          font-size: 13px;
          line-height: 1.8;
        }

        .course-footer {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 18px;
          margin-top: auto;
          padding-top: 24px;
        }

        .status {
          font-size: 12px;
          font-weight: 800;
        }

        .active {
          color: #2e9660;
        }

        .inactive {
          color: #91899e;
        }

        button {
          padding: 13px 20px;
          border: none;
          border-radius: 11px;
          background: #0879D1;
          color: white;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
        }

        button:hover {
          background: #5848d4;
        }

        .message {
          padding: 35px;
          border: 1px solid #e8e2f8;
          border-radius: 18px;
          background: white;
          color: #817991;
        }

        @media (max-width: 750px) {
          .courses-page {
            padding: 30px 16px 80px;
          }

          .course-grid {
            grid-template-columns: 1fr;
          }

          h1 {
            font-size: 29px;
          }
        }
      `}</style>
    </main>
  );
}
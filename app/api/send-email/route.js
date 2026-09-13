import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

export async function POST(request) {
  try {
    const authHeader =
      request.headers.get('authorization')

    if (
      !authHeader ||
      !authHeader.startsWith('Bearer ')
    ) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
        },
        {
          status: 401,
        }
      )
    }

    const accessToken =
      authHeader
        .replace('Bearer ', '')
        .trim()

    if (!accessToken) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
        },
        {
          status: 401,
        }
      )
    }

    /*
      IMPORTANT:
      Authorization token-ийг Supabase client-ийн
      бүх request дээр дамжуулна.
    */
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        global: {
          headers: {
            Authorization:
              `Bearer ${accessToken}`,
          },
        },

        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      }
    )

    /*
      1. Token valid эсэх
    */
    const {
      data: userData,
      error: userError,
    } = await supabase.auth.getUser(
      accessToken
    )

    if (
      userError ||
      !userData?.user
    ) {
      return NextResponse.json(
        {
          error: 'Invalid session',
        },
        {
          status: 401,
        }
      )
    }

    /*
      2. Admin мөн эсэх
    */
    const {
      data: profile,
      error: profileError,
    } = await supabase
      .from('profiles')
      .select('role')
      .eq(
        'id',
        userData.user.id
      )
      .single()

    if (profileError) {
      console.error(
        'PROFILE ERROR:',
        profileError
      )

      return NextResponse.json(
        {
          error:
            'Admin profile шалгаж чадсангүй.',
        },
        {
          status: 500,
        }
      )
    }

    if (
      profile?.role !== 'admin'
    ) {
      return NextResponse.json(
        {
          error:
            'Admin access required',
        },
        {
          status: 403,
        }
      )
    }

    /*
      3. Form data
    */
    const body =
      await request.json()

    const to =
      body?.to?.trim()

    const subject =
      body?.subject?.trim()

    const message =
      body?.message?.trim()

    if (
      !to ||
      !subject ||
      !message
    ) {
      return NextResponse.json(
        {
          error:
            'Recipient, subject, message шаардлагатай.',
        },
        {
          status: 400,
        }
      )
    }

    /*
      4. Resend key
    */
    if (
      !process.env.RESEND_API_KEY
    ) {
      return NextResponse.json(
        {
          error:
            'RESEND_API_KEY тохируулаагүй байна.',
        },
        {
          status: 500,
        }
      )
    }

    /*
      5. Send email
    */
    const resendResponse =
      await fetch(
        'https://api.resend.com/emails',
        {
          method: 'POST',

          headers: {
            Authorization:
              `Bearer ${process.env.RESEND_API_KEY}`,

            'Content-Type':
              'application/json',
          },

          body: JSON.stringify({
            from:
              'LEARN·MINEA <onboarding@resend.dev>',

            to: [to],

            subject,

            html: `
              <div
                style="
                  font-family:
                    Arial,
                    Helvetica,
                    sans-serif;
                  max-width: 620px;
                  margin: 0 auto;
                  padding: 32px 20px;
                  color: #292931;
                "
              >
                <div
                  style="
                    font-size: 18px;
                    font-weight: 900;
                    margin-bottom: 28px;
                  "
                >
                  LEARN<span
                    style="
                      color: #6C5CE7;
                    "
                  >·</span>MINEA
                </div>

                <h1
                  style="
                    font-size: 24px;
                    margin: 0 0 18px;
                  "
                >
                  ${escapeHtml(subject)}
                </h1>

                <div
                  style="
                    font-size: 15px;
                    line-height: 1.75;
                    white-space: pre-wrap;
                    color: #55545D;
                  "
                >${escapeHtml(message)}</div>

                <div
                  style="
                    margin-top: 32px;
                    padding-top: 18px;
                    border-top:
                      1px solid #ECE8F7;
                    color: #9996A0;
                    font-size: 12px;
                  "
                >
                  LEARN·MINEA
                </div>
              </div>
            `,
          }),
        }
      )

    const resendData =
      await resendResponse.json()

    if (!resendResponse.ok) {
      console.error(
        'RESEND ERROR:',
        resendData
      )

      return NextResponse.json(
        {
          error:
            resendData?.message ||
            'Email илгээж чадсангүй.',
        },
        {
          status:
            resendResponse.status,
        }
      )
    }

    return NextResponse.json({
      success: true,
      id: resendData?.id,
    })
  } catch (error) {
    console.error(
      'SEND EMAIL API ERROR:',
      error
    )

    return NextResponse.json(
      {
        error:
          error?.message ||
          'Server error',
      },
      {
        status: 500,
      }
    )
  }
}
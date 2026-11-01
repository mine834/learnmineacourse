'use client'

import { useId, useRef, useState } from 'react'

export default function BookPreview({ url, title }) {
  const dialogRef = useRef(null)
  const headingId = useId()
  const [opened, setOpened] = useState(false)

  function openPreview() {
    setOpened(true)
    dialogRef.current?.showModal()
  }

  return <>
    <button type="button" className="previewButton" disabled={!url} onClick={openPreview}>
      Уншиж үзэх
    </button>
    {!url && <p className="previewHint">Жишээ PDF хараахан нэмэгдээгүй байна.</p>}
    <dialog ref={dialogRef} aria-labelledby={headingId} className="previewDialog"
      onClose={() => setOpened(false)}
      onClick={event => { if (event.target === dialogRef.current) dialogRef.current.close() }}>
      <div className="previewPanel">
        <header className="previewHeader">
          <div><p>PDF PREVIEW</p><h2 id={headingId}>{title}</h2></div>
          <button type="button" className="closePreview" aria-label="Preview хаах" onClick={() => dialogRef.current.close()}>✕</button>
        </header>
        {opened && url && <iframe src={`${url}#toolbar=0&navpanes=0&view=FitH`} title={`${title} — PDF Preview`} />}
        {url && <a href={url} target="_blank" rel="noopener noreferrer" className="separatePreview">PDF-ийг тусдаа цонхонд нээх ↗</a>}
      </div>
    </dialog>
    <style jsx>{`
      .previewButton { background:#fff;border:1px solid #dcdde3;border-radius:10px;padding:17px 24px;font:600 16px Arial,sans-serif;cursor:pointer;min-height:56px; }
      .previewButton:hover:not(:disabled) { border-color:#18191b;background:#f7f7f8; }
      .previewButton:disabled { color:#969aa5;cursor:default; }
      .previewHint { flex-basis:100%;font-size:12px;color:#818592;margin:0; }
      .previewDialog { position:fixed; inset:0; margin:auto; border:0; padding:0; width:min(620px,92vw); max-width:92vw; max-height:84dvh; border-radius:16px; background:#fff; color:#18191b; box-shadow:0 24px 90px #0004; }
      .previewDialog::backdrop { background:#111827aa; }
      .previewPanel { display:flex; flex-direction:column; height:72dvh; }
      .previewHeader { display:flex; justify-content:space-between; align-items:center; gap:12px; padding:12px 18px; }
      .previewHeader p { color:#818592;letter-spacing:2px;font-size:10px;margin:0 0 6px; }
      .previewHeader h2 { font:700 20px Arial,sans-serif;margin:0; }
      .closePreview { flex-shrink:0;border:1px solid #e5e7eb;background:#fff;border-radius:50%;height:40px;width:40px;font-size:20px;cursor:pointer; }
      iframe { flex:1;min-height:0;width:100%;border:0;background:#f2f3f5; }
      .separatePreview { padding:14px 24px;color:#0879d1;font:14px Arial,sans-serif; }
      @media(max-width:650px) { .previewHeader { padding:14px; }.previewHeader h2 { font-size:16px; }.previewButton { flex:1; } }
    `}</style>
  </>
}

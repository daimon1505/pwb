import { useId, useState } from 'react'

export default function ControlSection({ title, value, children }) {
  const [expanded, setExpanded] = useState(true)
  const contentId = useId()
  return (
    <section className="control-section">
      <h3 className="control-section-heading">
        <button type="button" aria-expanded={expanded} aria-controls={contentId} onClick={() => setExpanded((current) => !current)}>
          <span>{title}</span>
          {value && <small>{value}</small>}
          <span className="section-chevron" aria-hidden="true">{expanded ? '−' : '+'}</span>
        </button>
      </h3>
      <div id={contentId} className="control-section-content" hidden={!expanded}>{children}</div>
    </section>
  )
}

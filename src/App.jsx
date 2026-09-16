import { useState } from 'react'
import './App.css'
import avaLogo from './assets/ava-logo.png'
import { Analytics } from '@vercel/analytics/react';

const PROXY_URL = 'https://customer-id-lookup-production.up.railway.app'

function App() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [customer, setCustomer] = useState(null)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) return

    setLoading(true)
    setError(null)
    setCustomer(null)

    try {
      const res = await fetch(`${PROXY_URL}/customer?email=${encodeURIComponent(email.trim())}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong. Please try again.')
      }

      setCustomer(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setEmail('')
    setCustomer(null)
    setError(null)
    setCopied(false)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(customer.customer_id).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="page">
      <header className="header">
        <div className="header-inner">
          <img src={avaLogo} alt="AVA Capital PLC" className="logo" />
        </div>
      </header>

      <main className="main">
        <div className="card">
          {!customer ? (
            <>
              <div className="card-top">
                <h1 className="card-title">Find your Customer ID</h1>
                <p className="card-desc">Enter the email address linked to your AVA Capital account and we'll retrieve your Customer ID.</p>
              </div>

              <form onSubmit={handleSubmit} className="form">
                <div className="field">
                  <label htmlFor="email" className="label">Email address</label>
                  <input
                    id="email"
                    type="email"
                    className={`input ${error ? 'input--error' : ''}`}
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (error) setError(null)
                    }}
                    disabled={loading}
                    required
                  />
                  {error && (
                    <p className="field-error">
                      <span className="error-icon">⚠</span> {error}
                    </p>
                  )}
                </div>

                <button type="submit" className="btn-primary" disabled={loading || !email.trim()}>
                  {loading ? (
                    <span className="btn-loading">
                      <span className="spinner" /> Looking up account…
                    </span>
                  ) : 'Find my Customer ID'}
                </button>
              </form>
            </>
          ) : (
            <div className="result">
              <div className="result-badge">Account found</div>
              <div className="customer-id-block">
                <span className="customer-id-label">Your Customer ID</span>
                <div className="customer-id-row">
                  <span className="customer-id-value">{customer.customer_id}</span>
                  <button className="copy-btn" onClick={handleCopy} title="Copy Customer ID">
                    {copied ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                      </svg>
                    )}
                  </button>
                </div>
                {copied && <span className="copy-feedback">Copied to clipboard!</span>}
              </div>
              <div className="customer-details">
                <div className="detail-row">
                  <span className="detail-label">Name</span>
                  <span className="detail-value">{customer.customer_name}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Email</span>
                  <span className="detail-value">{customer.email_address}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Account type</span>
                  <span className="detail-value">{customer.customer_type}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">KYC status</span>
                  <span className={`detail-value status status--${customer.kyc_status?.toLowerCase()}`}>
                    {customer.kyc_status}
                  </span>
                </div>
              </div>
              <button className="btn-ghost" onClick={handleReset}>Look up a different account</button>
            </div>
          )}
        </div>

        <p className="footer-note">
          Need help? Contact your AVA Capital relationship manager.
        </p>
      </main>
      <Analytics />
    </div>
  )
}

export default App

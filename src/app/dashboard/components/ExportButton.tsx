'use client'

import jsPDF from 'jspdf'
import type { Subscription, Category } from '@/types/database.types'

type SubscriptionWithCategory = Subscription & {
  category: Pick<Category, 'id' | 'name' | 'color'> | null
}

interface ExportButtonProps {
  subscriptions: SubscriptionWithCategory[]
}

export function ExportButton({ subscriptions }: ExportButtonProps) {
  function exportToCSV() {
    const headers = ['Name', 'Amount', 'Currency', 'Billing Cycle', 'Next Payment', 'Status', 'Category']
    const rows = subscriptions.map((sub) => [
      sub.name,
      sub.amount.toString(),
      sub.currency,
      sub.billing_cycle || '',
      sub.next_payment_date,
      sub.status,
      sub.category?.name || '',
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `subscriptions-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  function exportToJSON() {
    const data = subscriptions.map((sub) => ({
      name: sub.name,
      amount: sub.amount,
      currency: sub.currency,
      billing_cycle: sub.billing_cycle,
      next_payment_date: sub.next_payment_date,
      status: sub.status,
      category: sub.category?.name || null,
    }))

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `subscriptions-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  function exportToPDF() {
    const totalMonthly = subscriptions
      .filter((s) => s.status === 'active')
      .reduce((sum, sub) => {
        let monthly = sub.amount
        if (sub.billing_cycle === 'yearly') monthly /= 12
        if (sub.billing_cycle === 'weekly') monthly *= 4.33
        return sum + monthly
      }, 0)

    const totalYearly = totalMonthly * 12

    const byCategory: Record<string, number> = {}
    subscriptions.forEach((sub) => {
      const cat = sub.category?.name || 'Uncategorized'
      let monthly = sub.amount
      if (sub.billing_cycle === 'yearly') monthly /= 12
      if (sub.billing_cycle === 'weekly') monthly *= 4.33
      byCategory[cat] = (byCategory[cat] || 0) + monthly
    })

    const doc = new jsPDF({ unit: 'pt', format: 'a4' })
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 48
    const lineHeight = 18
    let y = margin

    function ensureSpace(requiredHeight = lineHeight) {
      if (y + requiredHeight > pageHeight - margin) {
        doc.addPage()
        y = margin
      }
    }

    function sectionTitle(text: string) {
      ensureSpace(lineHeight * 1.5)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(12)
      doc.text(text, margin, y)
      y += lineHeight
    }

    function bodyLine(text: string) {
      ensureSpace(lineHeight)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.text(text, margin, y)
      y += lineHeight
    }

    doc.setFillColor(99, 102, 241)
    doc.rect(0, 0, pageWidth, 72, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(18)
    doc.text('Subscription Report', margin, 44)
    doc.setTextColor(15, 23, 42)
    y = 100

    bodyLine(`Generated: ${new Date().toLocaleString()}`)
    y += 6

    sectionTitle('Summary')
    bodyLine(`Total Subscriptions: ${subscriptions.length}`)
    bodyLine(`Active: ${subscriptions.filter((s) => s.status === 'active').length}`)
    bodyLine(`Paused: ${subscriptions.filter((s) => s.status === 'paused').length}`)
    bodyLine(`Cancelled: ${subscriptions.filter((s) => s.status === 'cancelled').length}`)
    y += 6

    sectionTitle('Spending')
    bodyLine(`Estimated Monthly: $${totalMonthly.toFixed(2)}`)
    bodyLine(`Estimated Yearly: $${totalYearly.toFixed(2)}`)
    y += 6

    sectionTitle('By Category (Monthly)')
    const categoryLines = Object.entries(byCategory)
      .sort((a, b) => b[1] - a[1])
      .map(([cat, amount]) => `${cat}: $${amount.toFixed(2)}`)

    if (categoryLines.length === 0) {
      bodyLine('No category data available.')
    } else {
      categoryLines.forEach((line) => bodyLine(line))
    }

    y += 10
    sectionTitle('Subscriptions')

    if (subscriptions.length === 0) {
      bodyLine('No subscriptions found.')
    } else {
      subscriptions.forEach((sub, index) => {
        let normalizedMonthly = sub.amount
        if (sub.billing_cycle === 'yearly') normalizedMonthly /= 12
        if (sub.billing_cycle === 'weekly') normalizedMonthly *= 4.33

        const details = `${index + 1}. ${sub.name} | ${sub.currency} ${sub.amount.toFixed(2)} (${sub.billing_cycle || 'n/a'}) | ${sub.status} | ${sub.category?.name || 'Uncategorized'} | ~${sub.currency} ${normalizedMonthly.toFixed(2)}/mo`
        const wrapped = doc.splitTextToSize(details, pageWidth - margin * 2)

        wrapped.forEach((line: string) => {
          bodyLine(line)
        })
      })
    }

    const dateStamp = new Date().toISOString().split('T')[0]
    doc.save(`subscription-report-${dateStamp}.pdf`)
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={exportToCSV}
        className="px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition"
        title="Export as CSV"
      >
        CSV
      </button>
      <button
        onClick={exportToJSON}
        className="px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition"
        title="Export as JSON"
      >
        JSON
      </button>
      <button
        onClick={exportToPDF}
        className="px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition"
        title="Export as PDF"
      >
        PDF
      </button>
    </div>
  )
}

import TopNavBar from '../components/TopNavBar'

function InvoiceModal({ isOpen, onClose }) {
  const [lineItems, setLineItems] = useState([
    { id: 1, desc: 'Tuition Fee - October', qty: 1, price: 450.00 },
    { id: 2, desc: 'Materials Fee - Art Supplies', qty: 1, price: 45.00 }
  ])

  const addLineItem = () => {
    setLineItems([...lineItems, { id: Date.now(), desc: '', qty: 1, price: 0 }])
  }

  const removeLineItem = (id) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter(item => item.id !== id))
    }
  }

  const updateLineItem = (id, field, value) => {
    setLineItems(lineItems.map(item => item.id === id ? { ...item, [field]: value } : item))
  }

  const subtotal = lineItems.reduce((sum, item) => sum + (Number(item.qty) * Number(item.price)), 0)

  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-dark/60 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-[24px] memphis-border-thick shadow-[8px_8px_0_0_#2F2F2F] flex flex-col my-auto relative animate-[slideUp_0.3s_ease-out]">
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 opacity-30 mix-blend-multiply pointer-events-none rounded-tr-[24px] bg-secondary/40" style={{ clipPath: 'polygon(100% 0, 0% 100%, 100% 100%)' }}></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 opacity-20 mix-blend-multiply pointer-events-none rounded-bl-[24px] bg-primary/40 rounded-full blur-xl"></div>
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 sm:p-8 border-b-[3px] border-dark bg-background/50 rounded-t-[20px] relative z-10">
          <div>
            <h2 className="font-headline text-2xl sm:text-3xl font-black text-dark tracking-tight flex items-center gap-3">
              <span className="material-symbols-outlined text-accent text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>receipt_long</span>
              Create New Invoice
            </h2>
            <p className="font-label text-dark/70 mt-1 text-sm sm:text-base">Generate a billing statement for student accounts.</p>
          </div>
          <button onClick={onClose} className="h-10 w-10 flex items-center justify-center rounded-full border-2 border-dark bg-white hover:bg-danger/20 hover:text-danger transition-colors group">
            <span className="material-symbols-outlined group-hover:rotate-90 transition-transform duration-300">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 flex flex-col gap-8 max-h-[70vh] overflow-y-auto relative z-10 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1 md:col-span-2">
              <label className="block font-label font-bold text-dark mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-primary">person</span> Student
              </label>
              <div className="relative">
                <select className="w-full h-12 pl-4 pr-10 rounded-xl border-2 border-dark bg-white text-dark font-body focus:ring-0 focus:outline-none focus:border-primary appearance-none cursor-pointer hover:bg-background/20 transition-colors shadow-memphis-sm">
                  <option disabled value="">Select a student...</option>
                  <option value="liam">Liam Thompson</option>
                  <option value="aria">Aria Rodriguez</option>
                  <option value="noah">Noah Patel</option>
                  <option value="emma">Emma Chen</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-dark/50">expand_more</span>
              </div>
            </div>
            
            <div>
              <label className="block font-label font-bold text-dark mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-primary">calendar_today</span> Invoice Date
              </label>
              <input type="date" className="w-full h-12 px-4 rounded-xl border-2 border-dark bg-white text-dark font-body focus:ring-0 focus:outline-none focus:border-primary hover:bg-background/20 transition-colors shadow-memphis-sm" defaultValue="2026-05-30" />
            </div>
            
            <div>
              <label className="block font-label font-bold text-dark mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-accent">event_upcoming</span> Due Date
              </label>
              <input type="date" className="w-full h-12 px-4 rounded-xl border-2 border-dark bg-white text-dark font-body focus:ring-0 focus:outline-none focus:border-accent hover:bg-background/20 transition-colors shadow-memphis-sm" />
            </div>
          </div>

          <div className="bg-secondary/20 p-6 rounded-xl border-2 border-dark">
            <div className="flex justify-between items-end mb-4">
              <label className="block font-headline font-bold text-lg text-dark flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">list_alt</span> Line Items
              </label>
            </div>
            
            <div className="grid grid-cols-12 gap-4 mb-2 px-2 font-label font-bold text-dark/60 text-xs uppercase tracking-wider hidden sm:grid">
              <div className="col-span-7">Description</div>
              <div className="col-span-2 text-center">Qty</div>
              <div className="col-span-2 text-right">Price</div>
              <div className="col-span-1"></div>
            </div>
            
            <div className="flex flex-col gap-3">
              {lineItems.map(item => (
                <div key={item.id} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center bg-white p-3 rounded-lg border-2 border-dark shadow-[2px_2px_0_0_#2F2F2F] group">
                  <div className="col-span-1 sm:col-span-7">
                    <input type="text" value={item.desc} onChange={(e) => updateLineItem(item.id, 'desc', e.target.value)} placeholder="e.g., Tuition Fee" className="w-full bg-transparent border-none p-1 focus:outline-none text-dark font-body placeholder:text-dark/30" />
                  </div>
                  <div className="col-span-1 sm:col-span-2 flex items-center gap-2 sm:block">
                    <span className="text-xs font-bold text-dark/50 sm:hidden w-10">Qty</span>
                    <input type="number" value={item.qty} onChange={(e) => updateLineItem(item.id, 'qty', e.target.value)} min="1" className="w-full bg-background/50 border-2 border-transparent focus:border-primary rounded p-1 text-center font-body text-dark focus:outline-none" />
                  </div>
                  <div className="col-span-1 sm:col-span-2 relative flex items-center gap-2 sm:block">
                    <span className="text-xs font-bold text-dark/50 sm:hidden w-10">Price</span>
                    <div className="relative w-full">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-dark/50 font-label">$</span>
                      <input type="number" value={item.price} onChange={(e) => updateLineItem(item.id, 'price', e.target.value)} min="0" step="0.01" className="w-full bg-background/50 border-2 border-transparent focus:border-primary rounded p-1 pl-6 text-right font-body text-dark focus:outline-none" />
                    </div>
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <button onClick={() => removeLineItem(item.id)} className="text-dark/30 hover:text-danger transition-colors p-1 rounded hover:bg-danger/10">
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <button onClick={addLineItem} className="mt-4 flex items-center gap-2 font-label font-bold text-primary hover:text-dark transition-colors bg-white/50 border-2 border-dashed border-primary hover:border-dark rounded-lg py-2 px-4 w-full justify-center">
              <span className="material-symbols-outlined">add_circle</span> Add Line Item
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col">
              <label className="block font-label font-bold text-dark mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-secondary">edit_note</span> Notes & Terms
              </label>
              <textarea className="w-full h-full min-h-[120px] p-4 rounded-xl border-2 border-dark shadow-memphis-sm bg-white text-dark font-body focus:ring-0 focus:outline-none focus:border-primary resize-none placeholder:text-dark/30 hover:bg-background/10 transition-colors" placeholder="Thank you for your business. Payment is due within 14 days of invoice date."></textarea>
            </div>
            
            <div className="bg-white p-6 rounded-xl border-2 border-dark shadow-[4px_4px_0_0_#C9B79C] flex flex-col justify-center relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-16 h-16 bg-primary/10 rounded-full"></div>
              <div className="space-y-3 font-body relative z-10">
                <div className="flex justify-between items-center text-dark/70 font-bold">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-dark/70 font-bold">
                  <span className="flex items-center gap-2">Tax (0%) <span className="material-symbols-outlined text-[16px] cursor-help" title="Click to edit tax rate">edit</span></span>
                  <span>$0.00</span>
                </div>
                <div className="h-[2px] bg-dark/20 w-full my-2"></div>
                <div className="flex justify-between items-center font-headline font-black text-2xl text-dark">
                  <span>Total Due</span>
                  <span className="text-primary">${subtotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 sm:p-8 border-t-[3px] border-dark bg-background/50 rounded-b-[20px] flex justify-end gap-4 relative z-10">
          <button onClick={onClose} className="px-6 py-3 rounded-xl font-label font-bold text-dark bg-white hover:bg-secondary border-2 border-dark transition-all duration-200 hover:shadow-[2px_2px_0_0_#2F2F2F]">
            Cancel
          </button>
          <button onClick={onClose} className="px-8 py-3 rounded-xl font-label font-bold text-white bg-primary hover:bg-primary/90 border-2 border-dark transition-all duration-200 shadow-[4px_4px_0_0_#2F2F2F] hover:-translate-y-px active:translate-y-1 active:translate-x-1 active:shadow-none flex items-center gap-2 group">
            <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">send</span>
            Send Invoice
          </button>
        </div>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase'

export default function StudentBilling() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [pendingStudents, setPendingStudents] = useState([])
  const [recentPayments, setRecentPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBillingData = async () => {
      try {
        const studentsSnapshot = await getDocs(collection(db, 'pendingStudents'))
        const studentsData = studentsSnapshot.docs.map(doc => doc.data())
        if (studentsData.length > 0) {
          setPendingStudents(studentsData)
        } else {
          setPendingStudents([
            { id: 1, name: 'Marcus Chen',   class: 'IELTS Intensive',   amount: '$600.00', status: 'Pending', statusColor: 'bg-secondary/30 text-dark border-dark/20', initials: 'MC', initialsColor: 'bg-secondary/20 text-dark/70 border-dark/20' },
            { id: 2, name: 'Aria Rodriguez',class: 'Communication Eng', amount: '$320.00', status: 'Overdue', statusColor: 'bg-accent/20 text-accent border-accent/30', initials: 'AR', initialsColor: 'bg-accent/20 text-accent border-accent/30' },
            { id: 3, name: 'Liam Thompson', class: 'English 9B',        amount: '$450.00', status: 'Paid',    statusColor: 'bg-primary/20 text-primary border-primary/30', initials: 'LT', initialsColor: 'bg-primary/20 text-primary border-primary/30' },
          ])
        }

        const paymentsSnapshot = await getDocs(collection(db, 'recentPayments'))
        const paymentsData = paymentsSnapshot.docs.map(doc => doc.data())
        if (paymentsData.length > 0) {
          setRecentPayments(paymentsData)
        } else {
          setRecentPayments([
            { id: 1, date: 'May 15, 2026', desc: 'Jane Smith - Tuition Term 2', amount: '+$450.00', method: 'Credit Card' },
            { id: 2, date: 'May 12, 2026', desc: 'Liam Thompson - Tuition Term 2', amount: '+$450.00', method: 'Bank Transfer' },
            { id: 3, date: 'May 10, 2026', desc: 'Elena Gilbert - IELTS Materials', amount: '+$75.00', method: 'Cash' },
            { id: 4, date: 'May 08, 2026', desc: 'Marcus Chen - Partial Payment', amount: '+$200.00', method: 'Credit Card' },
          ])
        }
      } catch (error) {
        console.error("Error fetching billing data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchBillingData()
  }, [])

  if (loading) return <div className="flex min-h-screen items-center justify-center font-headline text-2xl text-dark">Loading Billing...</div>

  return (
    <div className="flex flex-col min-h-screen">
      <TopNavBar />
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Page Header */}
          <div>
            <h2 className="text-4xl font-headline font-bold mb-2">Student Tuition & Payments</h2>
            <p className="text-dark/70 font-label text-lg">Manage school-wide billing and student accounts</p>
          </div>

          {/* Summary Section */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-primary/10 rounded-2xl p-8 memphis-border shadow-memphis relative overflow-hidden transition-transform hover:-translate-y-0.5 hover:shadow-memphis-lg">
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary/20 rounded-full blur-xl"></div>
              <div className="relative z-10">
                <p className="text-sm font-label font-bold text-primary uppercase tracking-wider mb-1">Total Collected</p>
                <h3 className="text-4xl font-headline font-bold">$42,850.00</h3>
                <p className="text-xs text-dark/60 mt-4 flex items-center gap-1 font-label">
                  <span className="material-symbols-outlined text-sm text-primary">trending_up</span>
                  12% increase from last term
                </p>
              </div>
            </div>

            <div className="bg-secondary/20 rounded-2xl p-8 memphis-border shadow-memphis relative overflow-hidden transition-transform hover:-translate-y-0.5 hover:shadow-memphis-lg">
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-secondary/30 rounded-full blur-xl"></div>
              <div className="relative z-10">
                <p className="text-sm font-label font-bold text-dark/70 uppercase tracking-wider mb-1">Pending Payments</p>
                <h3 className="text-4xl font-headline font-bold">$8,420.00</h3>
                <p className="text-xs text-dark/60 mt-4 font-label">14 students awaiting processing</p>
              </div>
            </div>

            <div className="bg-accent/10 rounded-2xl p-8 memphis-border shadow-memphis relative overflow-hidden transition-transform hover:-translate-y-0.5 hover:shadow-memphis-lg">
              <div className="absolute top-1/2 -right-10 w-20 h-20 bg-accent/20 rounded-lg rotate-45 blur-lg"></div>
              <div className="relative z-10">
                <p className="text-sm font-label font-bold text-accent uppercase tracking-wider mb-1">Overdue</p>
                <h3 className="text-4xl font-headline font-bold text-accent">$2,100.00</h3>
                <p className="text-xs text-dark/60 mt-4 font-label">5 students past due date</p>
              </div>
            </div>
          </section>

          {/* Student Payment List */}
          <section>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
              <h3 className="text-2xl font-headline font-bold">Học sinh chưa đóng tiền</h3>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-white text-sm font-bold memphis-border rounded-lg shadow-memphis-sm hover:-translate-y-px hover:shadow-memphis flex items-center gap-2 transition-all">
                  <span className="material-symbols-outlined text-sm">filter_list</span> Filter
                </button>
                <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-accent text-white text-sm font-bold memphis-border rounded-lg shadow-memphis-sm hover:-translate-y-px hover:shadow-memphis flex items-center gap-2 transition-all">
                  <span className="material-symbols-outlined text-sm">add</span> New Invoice
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-xl memphis-border shadow-memphis overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-secondary/30 border-b-2 border-dark text-sm font-bold font-headline">
                      <th className="py-4 px-6">Student Name</th>
                      <th className="py-4 px-6">Class</th>
                      <th className="py-4 px-6">Amount Due</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="font-label text-sm divide-y divide-dark/10">
                    {pendingStudents.map((s) => (
                      <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6 font-bold flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${s.initialsColor}`}>{s.initials}</div>
                          {s.name}
                        </td>
                        <td className="py-4 px-6">{s.class}</td>
                        <td className="py-4 px-6 font-medium">{s.amount}</td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold border ${s.statusColor}`}>
                            {s.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          {s.status === 'Paid' ? (
                            <button className="bg-white px-3 py-1.5 text-xs font-bold memphis-border rounded shadow-memphis-sm opacity-50 cursor-not-allowed">Receipt Issued</button>
                          ) : (
                            <button className="bg-primary text-white px-3 py-1.5 text-xs font-bold memphis-border rounded shadow-memphis-sm hover:-translate-y-px transition-transform">Record Payment</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Payment History */}
          <section className="pb-12">
            <h3 className="text-2xl font-headline font-bold mb-6">Học sinh đã đóng gần nhất</h3>
            <div className="bg-white rounded-xl memphis-border shadow-memphis overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-secondary/10 border-b-2 border-dark text-sm font-bold font-headline">
                      <th className="py-4 px-6">Date</th>
                      <th className="py-4 px-6">Student / Description</th>
                      <th className="py-4 px-6">Amount</th>
                      <th className="py-4 px-6">Method</th>
                      <th className="py-4 px-6 text-right">Statement</th>
                    </tr>
                  </thead>
                  <tbody className="font-label text-sm divide-y divide-dark/10">
                    {recentPayments.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6 font-medium">{p.date}</td>
                        <td className="py-4 px-6">{p.desc}</td>
                        <td className="py-4 px-6 font-medium text-primary">{p.amount}</td>
                        <td className="py-4 px-6 text-dark/60">{p.method}</td>
                        <td className="py-4 px-6 text-right">
                          <a href="#" className="text-dark/60 hover:text-primary transition-colors flex items-center justify-end gap-1 font-bold">
                            <span className="material-symbols-outlined text-sm">print</span> In
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </main>
      <InvoiceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}

import React from 'react'

export function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-dark/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white w-full max-w-md rounded-2xl memphis-border-thick shadow-memphis-lg flex flex-col overflow-hidden animate-[slideUp_0.2s_ease-out]">
        <div className="absolute top-0 left-0 w-full h-2 bg-danger"></div>
        <div className="p-6 pb-4 flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center shrink-0 border-2 border-danger/20 text-danger">
            <span className="material-symbols-outlined text-2xl">warning</span>
          </div>
          <div>
            <h2 className="font-headline font-bold text-xl text-dark mb-2">{title}</h2>
            <p className="font-body text-sm text-dark/80 leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="p-4 bg-background/50 border-t-2 border-dark flex justify-end gap-3">
          <button 
            onClick={onCancel} 
            className="px-5 py-2 rounded-lg font-label font-bold text-dark/70 hover:bg-dark/5 transition-colors"
          >
            Hủy
          </button>
          <button 
            onClick={onConfirm} 
            className="px-5 py-2 rounded-lg font-label font-bold text-white bg-danger memphis-border shadow-memphis-sm hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all"
          >
            Chắc chắn xoá
          </button>
        </div>
      </div>
    </div>
  )
}

export function AlertModal({ isOpen, title, message, onClose, type = 'info' }) {
  if (!isOpen) return null

  let colorClass = 'bg-primary'
  let icon = 'info'
  let textColor = 'text-primary'
  let bgTint = 'bg-primary/10'
  let borderTint = 'border-primary/20'

  if (type === 'success') {
    colorClass = 'bg-[#10B981]' // Custom emerald for success
    icon = 'check_circle'
    textColor = 'text-[#10B981]'
    bgTint = 'bg-[#10B981]/10'
    borderTint = 'border-[#10B981]/20'
  } else if (type === 'error') {
    colorClass = 'bg-danger'
    icon = 'error'
    textColor = 'text-danger'
    bgTint = 'bg-danger/10'
    borderTint = 'border-danger/20'
  } else if (type === 'warning') {
    colorClass = 'bg-accent'
    icon = 'warning'
    textColor = 'text-accent'
    bgTint = 'bg-accent/10'
    borderTint = 'border-accent/20'
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-dark/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-sm rounded-2xl memphis-border-thick shadow-memphis-lg flex flex-col overflow-hidden animate-[slideUp_0.2s_ease-out]">
        <div className={`absolute top-0 left-0 w-full h-2 ${colorClass}`}></div>
        <div className="p-6 pb-6 flex flex-col items-center text-center mt-2">
          <div className={`w-16 h-16 rounded-full ${bgTint} flex items-center justify-center border-2 ${borderTint} ${textColor} mb-4`}>
            <span className="material-symbols-outlined text-4xl">{icon}</span>
          </div>
          <h2 className="font-headline font-bold text-xl text-dark mb-2">{title}</h2>
          <p className="font-body text-sm text-dark/80 leading-relaxed">{message}</p>
        </div>
        <div className="p-4 bg-background/50 border-t-2 border-dark flex justify-center">
          <button 
            onClick={onClose} 
            className="w-full px-5 py-2.5 rounded-lg font-label font-bold text-white bg-dark memphis-border shadow-memphis-sm hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all"
          >
            Đã hiểu
          </button>
        </div>
      </div>
    </div>
  )
}

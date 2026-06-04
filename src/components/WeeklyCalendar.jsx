import { useState } from 'react'

const DAYS_MAP = {
  'T2': 1, // Monday
  'T3': 2,
  'T4': 3,
  'T5': 4,
  'T6': 5,
  'T7': 6,
  'CN': 0  // Sunday
}

const HOURS = Array.from({ length: 15 }, (_, i) => i + 7) // 7 AM to 9 PM

export default function WeeklyCalendar({ classes = [] }) {
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date()
    const day = today.getDay()
    const diff = today.getDate() - day + (day === 0 ? -6 : 1) // adjust when day is sunday
    const start = new Date(today.setDate(diff))
    start.setHours(0, 0, 0, 0)
    return start
  })

  const nextWeek = () => {
    const next = new Date(currentWeekStart)
    next.setDate(next.getDate() + 7)
    setCurrentWeekStart(next)
  }

  const prevWeek = () => {
    const prev = new Date(currentWeekStart)
    prev.setDate(prev.getDate() - 7)
    setCurrentWeekStart(prev)
  }

  const today = () => {
    const today = new Date()
    const day = today.getDay()
    const diff = today.getDate() - day + (day === 0 ? -6 : 1)
    const start = new Date(today.setDate(diff))
    start.setHours(0, 0, 0, 0)
    setCurrentWeekStart(start)
  }

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(currentWeekStart)
    date.setDate(date.getDate() + i)
    return date
  })

  // Generate events based on classes
  const events = []
  
  classes.forEach(cls => {
    if (!cls.days) return
    const daysArr = cls.days.split('/')
    daysArr.forEach(dayStr => {
      const dayIndex = DAYS_MAP[dayStr]
      if (dayIndex !== undefined) {
        // Match dayIndex to weekDays
        const eventDate = weekDays.find(d => d.getDay() === dayIndex)
        if (eventDate) {
          // get time
          let startTime = '18:00'
          let endTime = '19:30'
          if (cls.scheduleConfig && cls.scheduleConfig[dayStr]) {
             startTime = cls.scheduleConfig[dayStr].start
             endTime = cls.scheduleConfig[dayStr].end
          } else if (cls.time) {
             const [start, end] = cls.time.split('–')
             if (start) startTime = start.trim()
             if (end) endTime = end.trim()
          }

          events.push({
            id: `${cls.id}-${dayStr}`,
            title: cls.name,
            color: cls.color || '#D96C75',
            icon: cls.icon || 'book',
            room: cls.room || 'TBD',
            date: eventDate,
            startTime,
            endTime,
            dayIndex
          })
        }
      }
    })
  })

  const timeToMinutes = (time) => {
    const [h, m] = time.split(':').map(Number)
    return h * 60 + (m || 0)
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-b-xl relative z-0">
      {/* Header Controls */}
      <div className="flex justify-between items-center p-4 border-b-2 border-dark/10">
         <div className="flex items-center gap-2">
            <button onClick={prevWeek} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-secondary/20 text-dark/70 transition-colors">
               <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <button onClick={today} className="px-3 py-1 font-label font-bold text-xs bg-secondary/10 hover:bg-secondary/20 rounded-md text-dark/80 transition-colors">
               Hôm nay
            </button>
            <button onClick={nextWeek} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-secondary/20 text-dark/70 transition-colors">
               <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
         </div>
         <div className="font-headline font-bold text-dark">
            Tháng {currentWeekStart.getMonth() + 1}, {currentWeekStart.getFullYear()}
         </div>
      </div>
      
      {/* Calendar Grid */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative">
        <div className="flex min-w-full">
           {/* Time Column */}
           <div className="w-16 flex-shrink-0 border-r-2 border-dark/10 bg-background/20">
              <div className="h-12 border-b-2 border-dark/10"></div> {/* Empty corner */}
              {HOURS.map(hour => (
                 <div key={hour} className="h-12 border-b border-dark/5 relative">
                    <span className="absolute -top-2.5 right-2 text-xs font-label text-dark/40">{hour}:00</span>
                 </div>
              ))}
           </div>
           
           {/* Days Columns */}
           <div className="flex-1 grid grid-cols-7">
              {/* Day Headers */}
              <div className="col-span-7 grid grid-cols-7 border-b-2 border-dark/10 sticky top-0 bg-white z-10 shadow-sm">
                 {weekDays.map((date, i) => {
                    const isToday = new Date().toDateString() === date.toDateString()
                    const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
                    return (
                       <div key={i} className={`h-12 flex flex-col items-center justify-center border-r border-dark/10 ${isToday ? 'bg-primary/10' : ''}`}>
                          <span className={`text-[10px] font-label font-bold ${isToday ? 'text-primary' : 'text-dark/60'}`}>{dayNames[date.getDay()]}</span>
                          <span className={`text-sm font-headline font-bold ${isToday ? 'text-primary' : 'text-dark'}`}>{date.getDate()}</span>
                       </div>
                    )
                 })}
              </div>
              
              {/* Grid Cells & Events */}
              <div className="col-span-7 grid grid-cols-7 relative">
                 {/* Grid Lines */}
                 {weekDays.map((_, i) => (
                    <div key={i} className="border-r border-dark/10 relative">
                       {HOURS.map(hour => (
                          <div key={hour} className="h-12 border-b border-dark/5"></div>
                       ))}
                    </div>
                 ))}
                 
                 {/* Render Events */}
                 {events.map(event => {
                    const startMins = timeToMinutes(event.startTime)
                    const endMins = timeToMinutes(event.endTime)
                    const gridStartMins = 7 * 60 // 7 AM
                    
                    if (startMins < gridStartMins) return null // Hide events before 7 AM
                    
                    const top = ((startMins - gridStartMins) / 60) * 3 // 3rem = h-12
                    const height = ((endMins - startMins) / 60) * 3

                    
                    // Day column index (0 = Mon, 6 = Sun)
                    const colIndex = event.dayIndex === 0 ? 6 : event.dayIndex - 1
                    const left = `${(colIndex / 7) * 100}%`
                    const width = `${100 / 7}%`
                    
                    return (
                       <div 
                          key={event.id}
                          className="absolute p-1 z-20 group cursor-pointer"
                          style={{ top: `${top}rem`, height: `${height}rem`, left, width }}
                          onClick={() => setSelectedEvent(event)}
                       >
                          <div 
                             className="w-full h-full rounded-md border-2 border-dark/20 p-1.5 flex flex-col overflow-hidden transition-all hover:z-30 hover:shadow-memphis-sm hover:-translate-y-px hover:border-dark"
                             style={{ backgroundColor: event.color + '33', borderLeftColor: event.color, borderLeftWidth: '4px' }}
                          >
                             <div className="font-headline font-bold text-xs text-dark leading-tight truncate shrink-0">
                                {event.title}
                             </div>
                             <div className="font-label text-[10px] text-dark/70 mt-0.5 truncate shrink-0">
                                {event.startTime} - {event.endTime}
                             </div>
                             <div className="font-label text-[10px] text-dark/70 truncate flex items-center gap-0.5 mt-auto shrink-0">
                                <span className="material-symbols-outlined text-[10px]">meeting_room</span> {event.room}
                             </div>
                          </div>
                       </div>
                    )
                 })}
              </div>
           </div>
        </div>
      </div>
      
      {/* Event Details Modal */}
      {selectedEvent && (
         <div className="absolute inset-0 z-50 bg-dark/20 backdrop-blur-sm flex items-center justify-center p-4 rounded-b-xl" onClick={() => setSelectedEvent(null)}>
            <div 
               className="bg-white p-6 rounded-xl memphis-border shadow-memphis max-w-sm w-full relative" 
               onClick={e => e.stopPropagation()}
            >
               <button 
                  onClick={() => setSelectedEvent(null)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center hover:bg-danger/10 text-dark/70 hover:text-danger transition-colors"
               >
                  <span className="material-symbols-outlined text-sm">close</span>
               </button>
               
               <div className="flex items-center gap-3 mb-4 pr-6">
                  <div 
                     className="w-10 h-10 rounded-lg flex items-center justify-center border-2 border-dark/20"
                     style={{ backgroundColor: selectedEvent.color + '33', color: selectedEvent.color }}
                  >
                     <span className="material-symbols-outlined">{selectedEvent.icon}</span>
                  </div>
                  <div>
                     <h3 className="font-headline font-bold text-xl text-dark leading-tight">{selectedEvent.title}</h3>
                  </div>
               </div>
               
               <div className="space-y-3 font-label text-dark/80">
                  <div className="flex items-center gap-2">
                     <span className="material-symbols-outlined text-sm text-dark/50">schedule</span>
                     <span>{selectedEvent.startTime} - {selectedEvent.endTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <span className="material-symbols-outlined text-sm text-dark/50">meeting_room</span>
                     <span>Phòng: {selectedEvent.room}</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <span className="material-symbols-outlined text-sm text-dark/50">calendar_today</span>
                     <span>Thứ: {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][selectedEvent.dayIndex]}</span>
                  </div>
               </div>
            </div>
         </div>
      )}
    </div>
  )
}

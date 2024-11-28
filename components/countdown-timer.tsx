'use client'

import { useEffect, useState, useRef } from 'react'
import { Plus, Edit, Trash2, Play, ImageIcon, Moon, Sun } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import './styles.css'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import { registerLocale, setDefaultLocale } from "react-datepicker"
import { zhTW } from 'date-fns/locale'

registerLocale('zh-TW', zhTW)
setDefaultLocale('zh-TW')

interface CountdownEvent {
  id: string;
  title: string;
  targetDate: Date;
}

function DigitalNumber({ number, isEnding, isFlashing, isLightMode }: { number: number; isEnding: boolean; isFlashing: boolean; isLightMode: boolean }) {
  return (
    <div className={`digitalitem num-${number} ${isEnding ? 'ending' : ''} ${isFlashing ? 'flashing' : ''} ${isLightMode ? 'light-mode' : ''}`}>
      <div className="digitalbody h1"></div>
      <div className="digitalbody h2"></div>
      <div className="digitalbody h3"></div>
      <div className="digitalbody v1"></div>
      <div className="digitalbody v2"></div>
      <div className="digitalbody v3"></div>
      <div className="digitalbody v4"></div>
    </div>
  )
}

const presetColors = [
  '#aaaaaa', // 淺灰色
  '#311b92', // 深紫色
  '#004d40', // 深綠色
  '#b71c1c', // 深紅色
  '#263238'  // 深灰色
];

const getDefaultEventTime = () => {
  const date = new Date();
  // date.setMinutes(date.getMinutes() + 1);
  date.setSeconds(date.getSeconds() + 30);
  return date;
};

const getDefaultNewEvent = () => ({
  title: 'Event',
  targetDate: getDefaultEventTime()
});

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })
  const [events, setEvents] = useState<CountdownEvent[]>([])
  const [currentEvent, setCurrentEvent] = useState<CountdownEvent | null>(null)
  const [newEvent, setNewEvent] = useState<Partial<CountdownEvent>>(() => getDefaultNewEvent())
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [backgroundColor, setBackgroundColor] = useState('#aaaaaa')
  const [recentColors, setRecentColors] = useState<string[]>([])
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null)
  const [isEnding, setIsEnding] = useState(false)
  const [isFlashing, setIsFlashing] = useState(false)
  const [isCustomColor, setIsCustomColor] = useState(false)
  const [isLightMode, setIsLightMode] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!currentEvent) return

    const timer = setInterval(() => {
      const now = new Date().getTime()
      const distance = currentEvent.targetDate.getTime() - now

      const days = Math.floor(distance / (1000 * 60 * 60 * 24))
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((distance % (1000 * 60)) / 1000)

      setTimeLeft({ days, hours, minutes, seconds })

      if (distance <= 15000 && distance > 0) {
        setIsEnding(true)
      } else {
        setIsEnding(false)
      }

      if (distance <= 0) {
        setIsFlashing(true)
        setTimeout(() => {
          setIsFlashing(false)
          clearInterval(timer)
        }, 3000)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [currentEvent])

  const handleAddEvent = () => {
    if (newEvent.title && newEvent.targetDate) {
      const event: CountdownEvent = {
        id: Date.now().toString(),
        title: newEvent.title,
        targetDate: newEvent.targetDate
      }
      setEvents([...events, event])
      setNewEvent(getDefaultNewEvent())
      setIsDialogOpen(false)
    }
  }

  const handleEditEvent = (event: CountdownEvent) => {
    setNewEvent({
      id: event.id,
      title: event.title,
      targetDate: event.targetDate
    })
    setIsDialogOpen(true)
  }

  const handleUpdateEvent = () => {
    if (newEvent.id && newEvent.title && newEvent.targetDate) {
      const updatedEvent: CountdownEvent = {
        id: newEvent.id,
        title: newEvent.title,
        targetDate: newEvent.targetDate
      }
      setEvents(events.map(e => e.id === newEvent.id ? updatedEvent : e))

      if (currentEvent?.id === newEvent.id) {
        setCurrentEvent(updatedEvent)
      }

      setNewEvent(getDefaultNewEvent())
      setIsDialogOpen(false)
    }
  }

  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter(e => e.id !== id))
    if (currentEvent?.id === id) {
      setCurrentEvent(null)
    }
  }

  const handleStartCountdown = (event: CountdownEvent) => {
    setCurrentEvent(event)
  }

  const handleColorChange = (color: string) => {
    setBackgroundColor(color)
    setBackgroundImage(null)
    setIsCustomColor(true)

    const colorIndex = recentColors.indexOf(color)

    if (colorIndex !== -1) {
      const updatedColors = [
        color,
        ...recentColors.slice(0, colorIndex),
        ...recentColors.slice(colorIndex + 1)
      ].slice(0, 5)
      setRecentColors(updatedColors)
    } else {
      setRecentColors(prevColors => [color, ...prevColors].slice(0, 5))
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setBackgroundImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleImageUrl = (url: string) => {
    setBackgroundImage(url)
  }

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setNewEvent({ ...newEvent, targetDate: date })
    }
  }

  const handleResetColors = () => {
    setBackgroundColor(presetColors[0])
    setRecentColors([])
    setIsCustomColor(false)
    setBackgroundImage(null)
  }

  const toggleNumberStyle = () => {
    setIsLightMode(prev => !prev);
  };

  return (
    <div className="wrap">
      <div
        className="timer-container"
        style={{
          backgroundColor: backgroundImage ? 'rgba(0,0,0,0.5)' : backgroundColor,
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="timer-content">
          <div className="time-block">
            <div className="time-display">
              <DigitalNumber number={Math.floor(timeLeft.days / 10)} isEnding={isEnding} isFlashing={isFlashing} isLightMode={isLightMode} />
              <DigitalNumber number={timeLeft.days % 10} isEnding={isEnding} isFlashing={isFlashing} isLightMode={isLightMode} />
            </div>
            <div className="time-label">DAY</div>
          </div>
          <div className="time-block">
            <div className="time-display">
              <DigitalNumber number={Math.floor(timeLeft.hours / 10)} isEnding={isEnding} isFlashing={isFlashing} isLightMode={isLightMode} />
              <DigitalNumber number={timeLeft.hours % 10} isEnding={isEnding} isFlashing={isFlashing} isLightMode={isLightMode} />
            </div>
            <div className="time-label">HOUR</div>
          </div>
          <div className="time-block">
            <div className="time-display">
              <DigitalNumber number={Math.floor(timeLeft.minutes / 10)} isEnding={isEnding} isFlashing={isFlashing} isLightMode={isLightMode} />
              <DigitalNumber number={timeLeft.minutes % 10} isEnding={isEnding} isFlashing={isFlashing} isLightMode={isLightMode} />
            </div>
            <div className="time-label">MIN</div>
          </div>
          <div className="time-block">
            <div className="time-display">
              <DigitalNumber number={Math.floor(timeLeft.seconds / 10)} isEnding={isEnding} isFlashing={isFlashing} isLightMode={isLightMode} />
              <DigitalNumber number={timeLeft.seconds % 10} isEnding={isEnding} isFlashing={isFlashing} isLightMode={isLightMode} />
            </div>
            <div className="time-label">SEC</div>
          </div>
        </div>
      </div>
      <div className="color-picker">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">Change Background</Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="color-picker-content">
              <div className="color-picker-header">
                <Label htmlFor="custom-color">Custom Color</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetColors}
                >
                  Reset
                </Button>
              </div>
              <Input
                id="custom-color"
                type="color"
                value={backgroundColor}
                onChange={(e) => handleColorChange(e.target.value)}
              />
              <div className="color-presets">
                {(recentColors.length > 0 ? recentColors : presetColors).map((color) => (
                  <button
                    key={color}
                    className={`color-preset-button ${backgroundColor === color ? 'active' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => handleColorChange(color)}
                  />
                ))}
              </div>
              <Label htmlFor="image-url">Image URL</Label>
              <Input
                id="image-url"
                type="text"
                placeholder="Enter image URL"
                onChange={(e) => handleImageUrl(e.target.value)}
              />
              <Button onClick={() => fileInputRef.current?.click()}>
                <ImageIcon className="mr-2 h-4 w-4" /> Upload Image
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleImageUpload}
                accept="image/*"
              />
            </div>
          </PopoverContent>
        </Popover>
        <Button 
          variant="outline" 
          size="icon"
          onClick={toggleNumberStyle}
          className="ml-2"
        >
          {isLightMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </Button>
      </div>
      <div className="events-list">
        {events.map(event => (
          <div key={event.id} className="event-item">
            <div className="event-info">
              <span className="event-title">{event.title}</span>
              <span className="event-date">
                {event.targetDate.toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })}
              </span>
            </div>
            <div className="event-actions">
              <Button onClick={() => handleStartCountdown(event)} size="icon"><Play className="h-4 w-4" /></Button>
              <Button onClick={() => handleEditEvent(event)} size="icon"><Edit className="h-4 w-4" /></Button>
              <Button onClick={() => handleDeleteEvent(event.id)} size="icon" variant="destructive"><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button onClick={() => setNewEvent(getDefaultNewEvent())}>
            <Plus className="mr-2 h-4 w-4" /> Add Event
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{newEvent.id ? 'Edit Event' : 'Add New Event'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={newEvent.title || ''}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <div className="col-span-3">
                <DatePicker
                  selected={newEvent.targetDate}
                  onChange={handleDateChange}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat="yyyy/MM/dd HH:mm"
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  placeholderText="選擇日期和時間"
                  locale="zh-TW"
                  timeCaption="時間"
                />
              </div>
            </div>
          </div>
          <Button onClick={newEvent.id ? handleUpdateEvent : handleAddEvent}>
            {newEvent.id ? 'Update' : 'Add'} Event
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}


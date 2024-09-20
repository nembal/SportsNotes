import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { format, addDays } from "date-fns"

interface ActionPlanInputProps {
  onSubmit: (data: any) => void
}

export function ActionPlanInput({ onSubmit }: ActionPlanInputProps) {
  const [jsonInput, setJsonInput] = useState("")
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)

  const handleSubmit = () => {
    try {
      let parsedData = JSON.parse(jsonInput)
      if (startDate) {
        parsedData = adjustDatesToCalendar(parsedData, startDate)
      }
      onSubmit(parsedData)
    } catch (error) {
      alert("Invalid JSON. Please check your input.")
    }
  }

  const adjustDatesToCalendar = (data: any, start: Date) => {
    const dayMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    let currentDate = start

    return {
      ...data,
      weeks: data.weeks.map((week: any) => ({
        ...week,
        days: Object.entries(week.days).reduce((acc: any, [day, activities]) => {
          while (dayMap[currentDate.getDay()] !== day) {
            currentDate = addDays(currentDate, 1)
          }
          acc[format(currentDate, 'yyyy-MM-dd')] = activities
          currentDate = addDays(currentDate, 1)
          return acc
        }, {})
      }))
    }
  }

  return (
    <div className="grid gap-4">
      <Textarea
        placeholder="Paste your JSON here..."
        value={jsonInput}
        onChange={(e) => setJsonInput(e.target.value)}
        rows={10}
      />
      <div>
        <h3 className="text-lg font-semibold mb-2">Select Start Date:</h3>
        <Calendar
          mode="single"
          selected={startDate}
          onSelect={setStartDate}
          className="rounded-md border"
        />
      </div>
      <Button onClick={handleSubmit} disabled={!startDate}>Load Action Plan</Button>
    </div>
  )
}
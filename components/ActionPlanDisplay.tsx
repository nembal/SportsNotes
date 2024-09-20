import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { format, parse, isValid } from "date-fns"

interface Activity {
  activity: string | string[]
  duration?: string
  intensity?: string
  details?: string | string[]
}

interface Day {
  [key: string]: Activity[]
}

interface Week {
  weekNumber: number
  theme: string
  days: Day
  dailyTasks: string[]
}

interface ActionPlan {
  title: string
  weeks: Week[]
}

interface ActionPlanDisplayProps {
  plan: ActionPlan
}

const activityOptions = ["Run", "Swim", "Bike", "Strength Training", "Yoga", "Rest"]
const intensityOptions = [
  { value: "1", label: "Zone 1", description: "Very Light - 50-60% of max heart rate" },
  { value: "2", label: "Zone 2", description: "Light - 60-70% of max heart rate" },
  { value: "3", label: "Zone 3", description: "Moderate - 70-80% of max heart rate" },
  { value: "4", label: "Zone 4", description: "Hard - 80-90% of max heart rate" },
  { value: "5", label: "Zone 5", description: "Maximum - 90-100% of max heart rate" },
]

const parseDate = (dateString: string) => {
  // First, try to parse as ISO date
  let date = parse(dateString, "yyyy-MM-dd", new Date())
  
  // If that fails, try to parse as day name
  if (!isValid(date)) {
    date = parse(dateString, "EEEE", new Date())
  }
  
  // If both fail, return null
  if (!isValid(date)) {
    console.error(`Invalid date string: ${dateString}`)
    return null
  }
  
  return date
}

export function ActionPlanDisplay({ plan, onUpdate }: ActionPlanDisplayProps & { onUpdate: (plan: ActionPlan) => void }) {
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set())
  const [editingWeek, setEditingWeek] = useState<number | null>(null)
  const [editedWeek, setEditedWeek] = useState<Week | null>(null)

  const toggleTask = (taskId: string) => {
    setCompletedTasks(prev => {
      const newSet = new Set(prev)
      if (newSet.has(taskId)) {
        newSet.delete(taskId)
      } else {
        newSet.add(taskId)
      }
      return newSet
    })
  }

  const handleEdit = (weekNumber: number) => {
    const weekData = plan.weeks.find(w => w.weekNumber === weekNumber)
    if (weekData) {
      setEditingWeek(weekNumber)
      setEditedWeek({ ...weekData })
    }
  }

  const handleSaveEdit = () => {
    if (editedWeek) {
      const updatedPlan = {
        ...plan,
        weeks: plan.weeks.map(w => w.weekNumber === editingWeek ? editedWeek : w)
      }
      onUpdate(updatedPlan)
      setEditingWeek(null)
      setEditedWeek(null)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    if (editedWeek) {
      setEditedWeek({ ...editedWeek, [field]: value })
    }
  }

  const handleDailyTaskChange = (index: number, value: string) => {
    if (editedWeek) {
      const newDailyTasks = [...editedWeek.dailyTasks]
      newDailyTasks[index] = value
      setEditedWeek({ ...editedWeek, dailyTasks: newDailyTasks })
    }
  }

  const handleActivityChange = (date: string, activityIndex: number, field: string, value: string | string[]) => {
    if (editedWeek) {
      const newDays = { ...editedWeek.days }
      newDays[date] = newDays[date].map((activity, index) => 
        index === activityIndex ? { ...activity, [field]: value } : activity
      )
      setEditedWeek({ ...editedWeek, days: newDays })
    }
  }

  const renderEditForm = (week: Week) => (
    <div className="space-y-4">
      <div>
        <label htmlFor="weekTheme" className="block text-sm font-medium text-gray-700">Week Theme</label>
        <Input
          id="weekTheme"
          value={week.theme}
          onChange={(e) => handleInputChange('theme', e.target.value)}
          placeholder="Week theme"
        />
      </div>
      <div>
        <h4 className="font-semibold">Daily Tasks:</h4>
        {week.dailyTasks.map((task, index) => (
          <div key={index} className="mt-2">
            <label htmlFor={`dailyTask${index}`} className="block text-sm font-medium text-gray-700">Daily Task {index + 1}</label>
            <Input
              id={`dailyTask${index}`}
              value={task}
              onChange={(e) => handleDailyTaskChange(index, e.target.value)}
              placeholder={`Daily task ${index + 1}`}
            />
          </div>
        ))}
      </div>
      {Object.entries(week.days).map(([date, activities]) => (
        <div key={date}>
          <h4 className="font-semibold">{format(parseISO(date), 'EEEE, MMMM d, yyyy')}</h4>
          {activities.map((activity, index) => (
            <div key={index} className="space-y-2 ml-4 mt-2 p-4 border rounded-md">
              <div>
                <label htmlFor={`activity-${date}-${index}`} className="block text-sm font-medium text-gray-700">Activity</label>
                <Select
                  value={Array.isArray(activity.activity) ? activity.activity.join(', ') : activity.activity}
                  onValueChange={(value) => handleActivityChange(date, index, 'activity', value)}
                >
                  <SelectTrigger id={`activity-${date}-${index}`}>
                    <SelectValue placeholder="Select an activity" />
                  </SelectTrigger>
                  <SelectContent>
                    {activityOptions.map((option) => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor={`duration-${date}-${index}`} className="block text-sm font-medium text-gray-700">Duration</label>
                <Select
                  value={activity.duration || ''}
                  onValueChange={(value) => handleActivityChange(date, index, 'duration', value)}
                >
                  <SelectTrigger id={`duration-${date}-${index}`}>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({length: 24}, (_, i) => (i + 1) * 5).map(min => (
                      <SelectItem key={min} value={`${min} minutes`}>{min} minutes</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Intensity</label>
                <RadioGroup
                  value={activity.intensity || ''}
                  onValueChange={(value) => handleActivityChange(date, index, 'intensity', value)}
                >
                  {intensityOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={`intensity-${date}-${index}-${option.value}`} />
                      <label htmlFor={`intensity-${date}-${index}-${option.value}`} className="text-sm">
                        {option.label}
                        <p className="text-xs text-gray-500">{option.description}</p>
                      </label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              <div>
                <label htmlFor={`details-${date}-${index}`} className="block text-sm font-medium text-gray-700">Details</label>
                <Input
                  id={`details-${date}-${index}`}
                  value={Array.isArray(activity.details) ? activity.details.join(', ') : activity.details || ''}
                  onChange={(e) => handleActivityChange(date, index, 'details', e.target.value)}
                  placeholder="Details"
                />
              </div>
            </div>
          ))}
        </div>
      ))}
      <Button onClick={handleSaveEdit}>Save Changes</Button>
    </div>
  )

  const renderDaySchedule = (activities: Activity[], weekNumber: number, date: string) => {
    return (
      <ul className="space-y-4">
        {activities.map((activity, index) => {
          const taskId = `week${weekNumber}-${date}-${index}`
          const isCompleted = completedTasks.has(taskId)
          return (
            <li key={index} className={`flex items-start space-x-2 p-4 border rounded-md transition-all duration-300 ${isCompleted ? 'bg-green-100 border-green-300' : 'bg-white'}`}>
              <Checkbox
                id={taskId}
                checked={isCompleted}
                onCheckedChange={() => toggleTask(taskId)}
                className="mt-1"
              />
              <div className="flex-grow">
                <Badge className={`text-lg mb-2 ${isCompleted ? 'line-through opacity-50' : ''}`} variant="outline">
                  {Array.isArray(activity.activity) ? activity.activity.join(', ') : activity.activity}
                </Badge>
                <div className="flex space-x-2 mb-2">
                  {activity.duration && <Badge variant="secondary" className={isCompleted ? 'opacity-50' : ''}>{activity.duration}</Badge>}
                  {activity.intensity && (
                    <Badge variant="secondary" className={isCompleted ? 'opacity-50' : ''}>
                      Zone {activity.intensity}
                      <span className="text-xs block">
                        {intensityOptions.find(opt => opt.value === activity.intensity)?.description}
                      </span>
                    </Badge>
                  )}
                </div>
                <label
                  htmlFor={taskId}
                  className={`block ${isCompleted ? 'line-through text-gray-500' : ''}`}
                >
                  {activity.details && (
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      {Array.isArray(activity.details)
                        ? activity.details.map((detail, i) => <li key={i}>{detail}</li>)
                        : <li>{activity.details}</li>
                      }
                    </ul>
                  )}
                </label>
              </div>
              {isCompleted && (
                <Badge variant="success" className="ml-2">
                  Completed
                </Badge>
              )}
            </li>
          )
        })}
      </ul>
    )
  }

  const jsonTemplate = {
    title: "4-Week Action Plan: [Your Plan Title]",
    weeks: [
      {
        weekNumber: 1,
        theme: "Week 1 Theme",
        days: {
          Monday: [
            { activity: ["Activity 1"], duration: "30 minutes", intensity: "moderate" },
            { activity: ["Activity 2"], duration: "20 minutes", details: "Additional details here" }
          ],
          Tuesday: [
            { activity: ["Activity 1"], duration: "25 minutes", intensity: "high" },
            { activity: ["Activity 2"], duration: "35 minutes", details: ["Detail 1", "Detail 2"] }
          ],
          // ... (repeat for other days of the week)
        },
        dailyTasks: [
          "Daily task 1",
          "Daily task 2"
        ]
      },
      // ... (repeat for other weeks)
    ]
  }

  const handleCopyJSON = () => {
    const jsonString = JSON.stringify(jsonTemplate, null, 2)
    navigator.clipboard.writeText(jsonString).then(() => {
      alert("JSON template copied to clipboard!")
    }).catch(err => {
      console.error('Failed to copy text: ', err)
    })
  }

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_300px]">
      <div>
        <h2 className="text-xl font-bold mb-4">{plan.title}</h2>
        {plan.weeks.map((week) => (
          <Card key={week.weekNumber} className="mb-6">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Week {week.weekNumber}: {week.theme}</span>
                <Button onClick={() => handleEdit(week.weekNumber)}>Edit</Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {editingWeek === week.weekNumber && editedWeek ? (
                renderEditForm(editedWeek)
              ) : (
                <>
                  <h4 className="font-semibold mt-2 mb-2">Daily Tasks:</h4>
                  <ul className="space-y-2 mb-4">
                    {week.dailyTasks.map((task, index) => {
                      const taskId = `week${week.weekNumber}-daily-${index}`
                      return (
                        <li key={index} className="flex items-start space-x-2">
                          <Checkbox
                            id={taskId}
                            checked={completedTasks.has(taskId)}
                            onCheckedChange={() => toggleTask(taskId)}
                          />
                          <label
                            htmlFor={taskId}
                            className={`flex-grow ${completedTasks.has(taskId) ? 'line-through text-gray-500' : ''}`}
                          >
                            {task}
                          </label>
                        </li>
                      )
                    })}
                  </ul>
                  {Object.entries(week.days).map(([date, activities]) => {
                    const parsedDate = parseDate(date)
                    return (
                      <div key={date} className="mb-4">
                        <h4 className="font-semibold mb-2">
                          {parsedDate 
                            ? format(parsedDate, 'EEEE, MMMM d, yyyy')
                            : date // fallback to original string if parsing fails
                          }
                        </h4>
                        {renderDaySchedule(activities, week.weekNumber, date)}
                      </div>
                    )
                  })}
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      <div>
        <Calendar />
        <Button onClick={handleCopyJSON} className="mt-4 w-full">Copy JSON Template</Button>
      </div>
    </div>
  )
}
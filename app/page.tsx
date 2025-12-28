'use client'

import { useState, useEffect } from 'react'
import { Bell, Plus, Trash2, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react'
import { format, differenceInDays, isPast, isToday, isTomorrow } from 'date-fns'

interface Assignment {
  id: string
  title: string
  subject: string
  dueDate: string
  priority: 'high' | 'medium' | 'low'
  completed: boolean
  notes?: string
}

export default function Home() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [showForm, setShowForm] = useState(false)
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    subject: '',
    dueDate: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    notes: ''
  })

  useEffect(() => {
    const saved = localStorage.getItem('assignments')
    if (saved) {
      setAssignments(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    if (assignments.length > 0) {
      localStorage.setItem('assignments', JSON.stringify(assignments))
    }
  }, [assignments])

  const addAssignment = () => {
    if (!newAssignment.title || !newAssignment.dueDate) return

    const assignment: Assignment = {
      id: Date.now().toString(),
      title: newAssignment.title,
      subject: newAssignment.subject,
      dueDate: newAssignment.dueDate,
      priority: newAssignment.priority,
      completed: false,
      notes: newAssignment.notes
    }

    setAssignments([...assignments, assignment])
    setNewAssignment({ title: '', subject: '', dueDate: '', priority: 'medium', notes: '' })
    setShowForm(false)
  }

  const deleteAssignment = (id: string) => {
    setAssignments(assignments.filter(a => a.id !== id))
  }

  const toggleComplete = (id: string) => {
    setAssignments(assignments.map(a =>
      a.id === id ? { ...a, completed: !a.completed } : a
    ))
  }

  const getUrgencyMessage = (assignment: Assignment) => {
    const dueDate = new Date(assignment.dueDate)

    if (assignment.completed) {
      return { text: 'Completed', color: 'text-green-600', icon: CheckCircle2 }
    }

    if (isPast(dueDate) && !isToday(dueDate)) {
      return { text: 'Overdue!', color: 'text-red-600', icon: AlertCircle }
    }

    if (isToday(dueDate)) {
      return { text: 'Due Today!', color: 'text-red-500', icon: AlertCircle }
    }

    if (isTomorrow(dueDate)) {
      return { text: 'Due Tomorrow', color: 'text-orange-500', icon: Bell }
    }

    const daysLeft = differenceInDays(dueDate, new Date())
    if (daysLeft <= 3) {
      return { text: `${daysLeft} days left`, color: 'text-orange-400', icon: Bell }
    }

    if (daysLeft <= 7) {
      return { text: `${daysLeft} days left`, color: 'text-yellow-600', icon: Calendar }
    }

    return { text: `${daysLeft} days left`, color: 'text-gray-600', icon: Calendar }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-50 dark:bg-red-900/20'
      case 'medium': return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
      case 'low': return 'border-green-500 bg-green-50 dark:bg-green-900/20'
      default: return 'border-gray-500'
    }
  }

  const pendingAssignments = assignments.filter(a => !a.completed)
  const completedAssignments = assignments.filter(a => a.completed)

  const getAIReminder = () => {
    if (pendingAssignments.length === 0) {
      return "Great job! You have no pending assignments. Keep up the good work! 🎉"
    }

    const overdue = pendingAssignments.filter(a => isPast(new Date(a.dueDate)) && !isToday(new Date(a.dueDate)))
    const dueToday = pendingAssignments.filter(a => isToday(new Date(a.dueDate)))
    const dueTomorrow = pendingAssignments.filter(a => isTomorrow(new Date(a.dueDate)))

    let message = "📚 AI Schedule Reminder: "

    if (overdue.length > 0) {
      message += `You have ${overdue.length} overdue assignment${overdue.length > 1 ? 's' : ''}! `
    }

    if (dueToday.length > 0) {
      message += `${dueToday.length} assignment${dueToday.length > 1 ? 's are' : ' is'} due TODAY! `
    }

    if (dueTomorrow.length > 0) {
      message += `${dueTomorrow.length} assignment${dueTomorrow.length > 1 ? 's are' : ' is'} due tomorrow. `
    }

    if (overdue.length === 0 && dueToday.length === 0 && dueTomorrow.length === 0) {
      message += `You have ${pendingAssignments.length} pending assignment${pendingAssignments.length > 1 ? 's' : ''}. Stay organized!`
    }

    return message
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Bell className="w-8 h-8 text-indigo-600" />
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Schedule AI</h1>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              <Plus className="w-5 h-5" />
              Add Assignment
            </button>
          </div>

          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 rounded-lg mb-6">
            <p className="text-lg font-medium">{getAIReminder()}</p>
          </div>

          {showForm && (
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6 border-2 border-indigo-200">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">New Assignment</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Assignment Title *"
                  value={newAssignment.title}
                  onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                  className="px-4 py-2 border rounded-lg dark:bg-gray-600 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="Subject"
                  value={newAssignment.subject}
                  onChange={(e) => setNewAssignment({ ...newAssignment, subject: e.target.value })}
                  className="px-4 py-2 border rounded-lg dark:bg-gray-600 dark:text-white"
                />
                <input
                  type="date"
                  value={newAssignment.dueDate}
                  onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
                  className="px-4 py-2 border rounded-lg dark:bg-gray-600 dark:text-white"
                />
                <select
                  value={newAssignment.priority}
                  onChange={(e) => setNewAssignment({ ...newAssignment, priority: e.target.value as any })}
                  className="px-4 py-2 border rounded-lg dark:bg-gray-600 dark:text-white"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
                <textarea
                  placeholder="Notes (optional)"
                  value={newAssignment.notes}
                  onChange={(e) => setNewAssignment({ ...newAssignment, notes: e.target.value })}
                  className="px-4 py-2 border rounded-lg dark:bg-gray-600 dark:text-white md:col-span-2"
                  rows={2}
                />
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={addAssignment}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
                >
                  Add
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {pendingAssignments.length > 0 && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Pending Assignments</h2>
            <div className="space-y-4">
              {pendingAssignments.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).map(assignment => {
                const urgency = getUrgencyMessage(assignment)
                const UrgencyIcon = urgency.icon
                return (
                  <div
                    key={assignment.id}
                    className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border-l-4 ${getPriorityColor(assignment.priority)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <input
                            type="checkbox"
                            checked={assignment.completed}
                            onChange={() => toggleComplete(assignment.id)}
                            className="w-5 h-5 cursor-pointer"
                          />
                          <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{assignment.title}</h3>
                        </div>
                        {assignment.subject && (
                          <p className="text-gray-600 dark:text-gray-300 mb-1">📖 {assignment.subject}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            📅 Due: {format(new Date(assignment.dueDate), 'MMM dd, yyyy')}
                          </span>
                          <span className={`flex items-center gap-1 font-semibold ${urgency.color}`}>
                            <UrgencyIcon className="w-4 h-4" />
                            {urgency.text}
                          </span>
                        </div>
                        {assignment.notes && (
                          <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">💬 {assignment.notes}</p>
                        )}
                      </div>
                      <button
                        onClick={() => deleteAssignment(assignment.id)}
                        className="text-red-500 hover:text-red-700 transition ml-4"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {completedAssignments.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Completed Assignments</h2>
            <div className="space-y-4">
              {completedAssignments.map(assignment => (
                <div
                  key={assignment.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 opacity-60"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="checkbox"
                          checked={assignment.completed}
                          onChange={() => toggleComplete(assignment.id)}
                          className="w-5 h-5 cursor-pointer"
                        />
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white line-through">{assignment.title}</h3>
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      </div>
                      {assignment.subject && (
                        <p className="text-gray-600 dark:text-gray-300 mb-1">📖 {assignment.subject}</p>
                      )}
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        📅 Was due: {format(new Date(assignment.dueDate), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteAssignment(assignment.id)}
                      className="text-red-500 hover:text-red-700 transition ml-4"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {assignments.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-12 text-center">
            <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">No assignments yet</h2>
            <p className="text-gray-600 dark:text-gray-400">Click "Add Assignment" to get started with your homework tracking!</p>
          </div>
        )}
      </div>
    </div>
  )
}

"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Plus, Check, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Todo {
  id: string
  text: string
  completed: boolean
  createdAt: string
}

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTodos()
  }, [])

  const loadTodos = async () => {
    try {
      const response = await fetch("/api/todos")
      if (response.ok) {
        const data = await response.json()
        setTodos(data)
      } else {
        const stored = localStorage.getItem("todos")
        if (stored) {
          setTodos(JSON.parse(stored))
        }
      }
    } catch (error) {
      const stored = localStorage.getItem("todos")
      if (stored) {
        setTodos(JSON.parse(stored))
      }
    }
    setLoading(false)
  }

  const saveTodos = async (updatedTodos: Todo[]) => {
    try {
      await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedTodos),
      })
    } catch (error) {
      localStorage.setItem("todos", JSON.stringify(updatedTodos))
    }
  }

  const addTodo = async () => {
    if (!newTodo.trim()) return

    const todo: Todo = {
      id: Date.now().toString(),
      text: newTodo.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    }

    const updatedTodos = [...todos, todo]
    setTodos(updatedTodos)
    setNewTodo("")
    await saveTodos(updatedTodos)
  }

  const toggleTodo = async (id: string) => {
    const updatedTodos = todos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo))
    setTodos(updatedTodos)
    await saveTodos(updatedTodos)
  }

  const deleteTodo = async (id: string) => {
    const updatedTodos = todos.filter((todo) => todo.id !== id)
    setTodos(updatedTodos)
    await saveTodos(updatedTodos)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addTodo()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-xl border-green-200">
          <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
            <CardTitle className="text-3xl font-bold text-center">ToDo List</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex gap-2 mb-6">
              <Input
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Додати нове завдання..."
                className="flex-1 border-green-300 focus:border-green-500 focus:ring-green-500"
              />
              <Button onClick={addTodo} className="bg-green-600 hover:bg-green-700 text-white px-4">
                <Plus className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-2">
              {todos.length === 0 ? (
                <div className="text-center py-12 text-green-600">
                  <div className="text-6xl mb-4">📝</div>
                  <p className="text-lg">Немає завдань. Додайте перше!</p>
                </div>
              ) : (
                todos.map((todo) => (
                  <div
                    key={todo.id}
                    className={`flex items-center gap-3 p-4 rounded-lg border transition-all duration-200 ${
                      todo.completed
                        ? "bg-green-50 border-green-200"
                        : "bg-white border-gray-200 hover:border-green-300"
                    }`}
                  >
                    <Button
                      onClick={() => toggleTodo(todo.id)}
                      variant="outline"
                      size="sm"
                      className={`p-1 h-8 w-8 rounded-full ${
                        todo.completed
                          ? "bg-green-600 border-green-600 text-white hover:bg-green-700"
                          : "border-green-300 hover:border-green-500 hover:bg-green-50"
                      }`}
                    >
                      {todo.completed && <Check className="h-4 w-4" />}
                    </Button>

                    <span className={`flex-1 ${todo.completed ? "line-through text-green-600" : "text-gray-800"}`}>
                      {todo.text}
                    </span>

                    <Button
                      onClick={() => deleteTodo(todo.id)}
                      variant="outline"
                      size="sm"
                      className="p-1 h-8 w-8 text-red-500 border-red-300 hover:bg-red-50 hover:border-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>

            {todos.length > 0 && (
              <div className="mt-6 text-center text-sm text-green-600">
                Всього: {todos.length} | Виконано: {todos.filter((t) => t.completed).length} | Залишилось:{" "}
                {todos.filter((t) => !t.completed).length}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

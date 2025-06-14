import { type NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

const TODOS_FILE = path.join(process.cwd(), "data", "todos.json")

async function ensureDataDir() {
  const dataDir = path.dirname(TODOS_FILE)
  try {
    await fs.access(dataDir)
  } catch {
    await fs.mkdir(dataDir, { recursive: true })
  }
}

async function readTodos() {
  try {
    await ensureDataDir()
    const data = await fs.readFile(TODOS_FILE, "utf8")
    return JSON.parse(data)
  } catch {
    return []
  }
}

async function writeTodos(todos: any[]) {
  await ensureDataDir()
  await fs.writeFile(TODOS_FILE, JSON.stringify(todos, null, 2))
}

export async function GET() {
  try {
    const todos = await readTodos()
    return NextResponse.json(todos)
  } catch (error) {
    return NextResponse.json({ error: "Failed to read todos" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const todos = await request.json()
    await writeTodos(todos)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to save todos" }, { status: 500 })
  }
}

const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());


let tasks = []; 
let currentId = 1; 


function isValidPriority(priority) {
  return ["low", "medium", "high"].includes(priority);
}

function parseTaskId(param) {
  const id = Number(param);
  return Number.isInteger(id) && id > 0 ? id : null;
}


app.get("/", (req, res) => {
  res.send("Task Manager API!");
});


app.get("/tasks", (req, res) => {
  let filtered = [...tasks];

 
  if (typeof req.query.completed !== "undefined") {
    if (req.query.completed !== "true" && req.query.completed !== "false") {
      return res.status(400).json({ error: "Invalid completed query parameter" });
    }
    const isCompleted = req.query.completed === "true";
    filtered = filtered.filter((t) => t.completed === isCompleted);
  }


  filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(filtered);
});


app.get("/tasks/priority/:level", (req, res) => {
  const level = req.params.level.toLowerCase();
  if (!isValidPriority(level)) {
    return res.status(400).json({ error: "Invalid priority level" });
  }
  const filtered = tasks.filter((t) => t.priority === level);
  res.json(filtered);
});


app.get("/tasks/:id", (req, res) => {
  const id = parseTaskId(req.params.id);
  if (!id) return res.status(400).json({ error: "Invalid task ID" });

  const task = tasks.find((t) => t.id === id);
  if (!task) return res.status(404).json({ error: "Task not found" });

  res.json(task);
});


app.post("/tasks", (req, res) => {
  const { title, description, completed = false, priority = "low" } = req.body;

  if (
    typeof title !== "string" || title.trim() === "" ||
    typeof description !== "string" || description.trim() === "" ||
    typeof completed !== "boolean" ||
    !isValidPriority(priority)
  ) {
    return res.status(400).json({ error: "Invalid task data" });
  }

  const task = {
    id: currentId++,
    title: title.trim(),
    description: description.trim(),
    completed,
    priority,
    createdAt: new Date(),
  };

  tasks.push(task);
  res.status(201).json(task);
});


app.put("/tasks/:id", (req, res) => {
  const id = parseTaskId(req.params.id);
  if (!id) return res.status(400).json({ error: "Invalid task ID" });

  const task = tasks.find((t) => t.id === id);
  if (!task) return res.status(404).json({ error: "Task not found" });

  const { title, description, completed, priority } = req.body;

  if (title !== undefined) {
    if (typeof title !== "string" || title.trim() === "") {
      return res.status(400).json({ error: "Invalid title" });
    }
    task.title = title.trim();
  }
  if (description !== undefined) {
    if (typeof description !== "string" || description.trim() === "") {
      return res.status(400).json({ error: "Invalid description" });
    }
    task.description = description.trim();
  }
  if (completed !== undefined) {
    if (typeof completed !== "boolean") {
      return res.status(400).json({ error: "Invalid completed flag" });
    }
    task.completed = completed;
  }
  if (priority !== undefined) {
    if (!isValidPriority(priority)) {
      return res.status(400).json({ error: "Invalid priority level" });
    }
    task.priority = priority;
  }

  res.json(task);
});

app.delete("/tasks/:id", (req, res) => {
  const id = parseTaskId(req.params.id);
  if (!id) return res.status(400).json({ error: "Invalid task ID" });

  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) return res.status(404).json({ error: "Task not found" });

  const [deleted] = tasks.splice(index, 1);
  res.json(deleted);
});


app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});


app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

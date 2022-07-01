const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  // Complete aqui
  const { username } = request.headers;
  const user = users.find((user) => user.username === username);
  if (!user) {
    return response.status(404).json({
      error: "User not found",
    });
  }

  request.username = user.username;

  return next();
}

app.post("/users", (request, response) => {
  const { name = "", username = "" } = request.body;

  const checkUsername = users.find((user) => user.username === username);

  if (checkUsername) {
    return response.status(400).json({
      error: "Username already exists",
    });
  }

  const user = {
    id: uuidv4(),
    name: name,
    username: username,
    todos: [],
  };

  users.push(user);

  return response.status(200).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { username } = request;

  const user = users.find((user) => user.username === username);

  return response.status(200).json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title = "", deadline = new Date().toISOString() } = request.body;
  const { username } = request;

  const user = users.find((user) => user.username === username);

  const todo = {
    id: uuidv4(), // precisa ser um uuid
    title: title,
    done: false,
    deadline: new Date(deadline).toISOString(),
    created_at: new Date().toISOString(),
  };

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { title, deadline } = request.body;
  const { username } = request;

  const user = users.find((user) => user.username === username);
  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(404).json({
      error: "Todo not found",
    });
  }

  title && (todo.title = title);
  deadline && (todo.deadline = new Date(deadline).toISOString());

  return response.status(200).json(todo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { username } = request;

  const user = users.find((user) => user.username === username);
  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(404).json({
      error: "Todo not found",
    });
  }

  todo.done = !todo.done;

  return response.status(200).json(todo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { username } = request;

  const user = users.find((user) => user.username === username);
  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(404).json({
      error: "Todo not found",
    });
  }

  user.todos = user.todos.filter((todo) => todo.id !== id);

  return response.status(204).json();
});

module.exports = app;

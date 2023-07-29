let todoList = JSON.parse(localStorage.getItem('todos')) || [];
let filteredList = [...todoList]; // Clone the initial list for filtering

function renderTodoList(filteredTodos = todoList) {
  const todoListDiv = document.getElementById("todoList");
  todoListDiv.innerHTML = "";
  if (filteredTodos.length === 0) {
    const noResultMessage = document.createElement("div");
    noResultMessage.textContent = "No results found.";
    todoListDiv.appendChild(noResultMessage);
    return; // Exit the function early, as there are no results to display.
  }
  const totalCountDiv = document.createElement("div");
  totalCountDiv.innerHTML = `Total Todos: ${filteredTodos.length}`;
  todoListDiv.appendChild(totalCountDiv);

  filteredTodos.forEach((todo, index) => {
        const listItem = document.createElement('li');
        listItem.setAttribute('draggable', 'true');
        listItem.innerHTML = `
          <input type="checkbox" ${todo.done ? 'checked' : ''} onclick="toggleDone(${index})">
          <span class="${todo.done ? 'done-task' : ''}" ${!todo.editing ? 'ondblclick="startEditing(event, ' + index + ')"' : ''} ${todo.editing ? 'contenteditable="true" onblur="updateTaskText(event, ' + index + ')"' : ''}>${todo.text}</span>
          <span>Category: 
            <select ${!todo.editing ? 'disabled' : ''} onchange="updateCategory(event, ${index})">
              <option value="work" ${todo.category === 'work' ? 'selected' : ''}>Work</option>
              <option value="personal" ${todo.category === 'personal' ? 'selected' : ''}>Personal</option>
              <option value="shopping" ${todo.category === 'shopping' ? 'selected' : ''}>Shopping</option>
              <!-- Add more categories here -->
            </select>
          </span>
          <span>Due Date:
          <input type="datetime-local" id="dueDateInput${index}" value="${todo.dueDate}" ${!todo.editing ? 'disabled' : ''}>
        </span>
        <span>Priority:
          <select id="prioritySelect${index}" ${!todo.editing ? 'disabled' : ''} onchange="updatePriority(event, ${index})">
            <option value="low" ${todo.priority === 'low' ? 'selected' : ''}>Low</option>
            <option value="medium" ${todo.priority === 'medium' ? 'selected' : ''}>Medium</option>
            <option value="high" ${todo.priority === 'high' ? 'selected' : ''}>High</option>
          </select>
        </span>
          <span class="tags">Tags: ${todo.tagsInput}</span> <!-- Display the tags here -->
          <button onclick="editTodo(${index})">${todo.editing ? 'Save' : 'Edit'}</button>
          <button onclick="deleteTodo(${index})">Delete</button>
          <ul>
          ${renderSubtasks(todo.subtasks)}
        </ul>
        <input type="text" id="subtaskInput${index}" placeholder="Add a subtask">
        <button onclick="addSubtask(${index})">Add Subtask</button>
        `;
        todoListDiv.appendChild(listItem);
  });
}
function renderSubtasks(subtasks) {
  if (!subtasks || subtasks.length === 0) return '';
  return subtasks.map(subtask => `
    <li>
      <input type="checkbox" ${subtask.done ? 'checked' : ''} onclick="toggleSubtaskDone(${subtask.id})">
      <span>${subtask.text}</span>
      <button onclick="removeSubtask(${subtask.id})">Remove</button>
    </li>
  `).join('');
}

function removeSubtask(subtaskId) {
  for (const todo of todoList) {
    if (todo.subtasks) {
      const subtaskIndex = todo.subtasks.findIndex(sub => sub.id === subtaskId);
      if (subtaskIndex !== -1) {
        todo.subtasks.splice(subtaskIndex, 1);
        saveToLocalStorage();
        renderTodoList();
        break;
      }
    }
  }
}
function addSubtask(index) {
  const subtaskInput = document.getElementById('subtaskInput' + index);
  const text = subtaskInput.value.trim();
  if (text !== '') {
    const newSubtask = {
      id: Date.now(), // Generate a unique ID for each subtask (using timestamp)
      text,
      done: false,
    };
    if (!todoList[index].subtasks) {
      todoList[index].subtasks = [];
    }
    todoList[index].subtasks.push(newSubtask);
    subtaskInput.value = '';
    renderTodoList();
    saveToLocalStorage();
  }
}

function toggleSubtaskDone(subtaskId) {
  for (const todo of todoList) {
    if (todo.subtasks) {
      const subtask = todo.subtasks.find(sub => sub.id === subtaskId);
      if (subtask) {
        subtask.done = !subtask.done;
        saveToLocalStorage();
        renderTodoList();
        break;
      }
    }
  }
}


function addTodo() {
  const taskInput = document.getElementById('taskInput');
  const categoryInput = document.getElementById('categoryInput');
  const dueDateInput = document.getElementById('dueDateInput');
  const priorityInput = document.getElementById('priorityInput');
  const tagsInput = document.getElementById("tags").value;
  // const tags = tagsInput.split(",").map(tag => tag.trim());
  const reminderInput = document.getElementById('reminderInput');
  const reminder = reminderInput.value.trim();
   // Clear the input field after adding the todo



  const text = taskInput.value.trim();
  const category = categoryInput.value;
  const dueDate = dueDateInput.value;
  const priority = priorityInput.value;
const rem_stat=false;
  if (text !== '' && category !== '' && dueDate !== '' && priority !== '') {
    const todo = {
      text,
      done: false,
      category,
      dueDate,
      priority,
      tagsInput,
      reminder,
      rem_stat
    };

    todoList.push(todo);
    filteredList.push(todo); // Add the new task to the filtered list as well
    taskInput.value = '';
    categoryInput.value = '';
    dueDateInput.value = '';
    priorityInput.value = '';
    reminderInput.value = '';
    renderTodoList();
    saveToLocalStorage();
  }
}


function editTodo(index) {
  if (todoList[index].editing) {
    // Save the changes and exit editing mode
    todoList[index].editing = false;
    renderTodoList();
    saveToLocalStorage();
  } else {
    // Enter editing mode
    todoList[index].editing = true;
    renderTodoList();
  }
}

function deleteTodo(index) {
  todoList.splice(index, 1);
  filteredList.splice(index, 1);
  renderTodoList();
  saveToLocalStorage();
}

function toggleDone(index) {
  todoList[index].done = !todoList[index].done;
  // updateFilteredList();
  renderTodoList();
  saveToLocalStorage();
}

function startEditing(event, index) {
  // Prevent immediate blur to allow editing
  event.target.removeAttribute('ondblclick');
  setTimeout(() => {
    event.target.setAttribute('contenteditable', 'true');
    event.target.focus();
  }, 0);
  todoList[index].editing = true;
}

function updateTaskText(event, index) {
  const newText = event.target.textContent.trim();
  if (newText !== '') {
    todoList[index].text = newText;
    todoList[index].editing = false;
    saveToLocalStorage();
    renderTodoList();
  }
}



// Function to apply due date filter
function filterByDueDate() {
  const dueDateFilter = document.getElementById("dueDateFilter").value;
  const filteredTodos = todoList.filter(todo => {
    return todo.dueDate === dueDateFilter;
  });
  renderTodoList(filteredTodos);
}


// Function to apply category filter
function filterByCategory() {
  const categoryFilter = document.getElementById("categoryFilter").value;
  if (categoryFilter === "") {
    renderTodoList();
  } else {
    const filteredTodos = todoList.filter(todo => {
      return todo.category === categoryFilter;
    });
    renderTodoList(filteredTodos);
  }
}

// Function to apply priority filter
function filterByPriority() {
  const priorityFilter = document.getElementById("priorityFilter").value;
  if (priorityFilter === "") {
    renderTodoList();
  } else {
    const filteredTodos = todoList.filter(todo => {
      return todo.priority === priorityFilter;
    });
    renderTodoList(filteredTodos);
  }
}

// Function to reset filters and show all todos
function resetFilters() {
  document.getElementById("dueDateFilter").value = "";
  document.getElementById("categoryFilter").value = "";
  document.getElementById("priorityFilter").value = "";
  renderTodoList();
}


function sortTodoList(sortBy) {
  switch (sortBy) {
    case "dueDate":
      todoList.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
      break;
    case "priority":
      todoList.sort((a, b) => priorityValue(a.priority) - priorityValue(b.priority));
      break;
    default:
      break;
  }

  renderTodoList();
}

function priorityValue(priority) {
  switch (priority) {
    case "low":
      return 1;
    case "medium":
      return 2;
    case "high":
      return 3;
    default:
      return 0;
  }
}
function viewBacklogs() {
  const currentDate = new Date();
  alert("It shows all the activities that are not completed and their due dates have passed")
  const backlogs = todoList.filter(todo => !todo.done && new Date(todo.dueDate) < currentDate);
  renderTodoList(backlogs);
}
function viewAllLogs() {
  // const backlogs = todoList.filter(todo => !todo.done);
  renderTodoList();
}


function searchTasks() {
  const searchQuery = document.getElementById("searchQuery").value.trim().toLowerCase();
  const searchOption = document.getElementById("searchOption").value;

  let filteredTodoList;

  switch (searchOption) {
    case "exact":
      filteredTodoList = todoList.filter(todo => todo.text.toLowerCase() === searchQuery);
      break;
    case "similar":
      filteredTodoList = todoList.filter(todo => todo.text.toLowerCase().includes(searchQuery));
      break;
    case "partial":
      filteredTodoList = todoList.filter(todo => todo.text.toLowerCase().includes(searchQuery));
      break;
    case "tags":
      filteredTodoList = todoList.filter(todo => todo.tags.includes(searchQuery));
      break;
    default:
      filteredTodoList = todoList;
      break;
  }

  renderTodoList(filteredTodoList);
}


function checkReminders() {
  const currentDate = new Date();

  todoList.forEach(todo => {
    if (todo.reminder && todo.rem_stat==false) {
      const reminderDate = new Date(todo.reminder);
      if (reminderDate <= currentDate) {
        // Trigger the reminder for this task (e.g., show a notification)
        alert(`Reminder for "${todo.text}"!`);
        
        // Update the reminder status to "triggered" to prevent duplicate alerts
        todo.rem_stat = true;
        saveToLocalStorage();
        
        renderTodoList();
      }
    }
  });
}

// Call the checkReminders function periodically, e.g., every minute
setInterval(checkReminders, 1000); // 60000 milliseconds = 1 minute



function saveToLocalStorage() {
  localStorage.setItem('todos', JSON.stringify(todoList));
}


// let dragIndex;

// function handleDragStart(event) {
//   const target = event.target;
//   if (target.matches('li')) {
//     // event.preventDefault();
//     dragIndex = Array.from(target.parentNode.children).indexOf(target);
//     event.dataTransfer.setData('text/plain', dragIndex);
//     console.log(dragIndex)
//   }
// }

// function handleDragOver(event) {
//   // console.log(dragIndex)
//   event.preventDefault();
// }

// function handleDrop(event) {
//   const target = event.target;
//   if (target.matches('li')) {
//     event.preventDefault();
//     const dropIndex = Array.from(target.parentNode.children).indexOf(target);
//     console.log(dropIndex)
//     moveItem(dragIndex, dropIndex);
//     renderTodoList();
//   }
// }


let dragIndex;

function handleDragStart(event) {
  const target = event.target;
  if (target.matches('li')) {
    // event.preventDefault();
    dragIndex = Array.from(target.parentNode.children).indexOf(target);
    event.dataTransfer.setData('text/plain', dragIndex);
    console.log('Drag Start - Index:', dragIndex);
  }
}

function handleDragOver(event) {
  console.log('Drag Over');
  event.preventDefault();
}

function handleDrop(event) {
  const target = event.target.closest('li'); // Find the closest parent <li> element
  console.log('Drop Event Target:', event.target);
  console.log('Closest <li> Element:', target);

  try {
    if (target) {
      event.preventDefault();
      const dropIndex = Array.from(target.parentNode.children).indexOf(target);
      console.log('Drop Index:', dropIndex);
      moveItem(dragIndex, dropIndex);
      renderTodoList();
    }
  } catch (error) {
    console.error('Error in handleDrop:', error);
  }
}

// Step 4: Implement the 'moveItem' function
function moveItem(sourceIndex, targetIndex) {
  const [item] = todoList.splice(sourceIndex-1, 1);
  todoList.splice(targetIndex-1, 0, item);
}

document.addEventListener('dragstart', handleDragStart);
document.addEventListener('dragover', handleDragOver);
document.addEventListener('drop', handleDrop);


// document.addEventListener("DOMContentLoaded", function () {
//   const dueDateFilter = document.getElementById("dueDateFilter");
//   dueDateFilter.addEventListener("change", filterByDueDate);

//   const categoryFilter = document.getElementById("categoryFilter");
//   categoryFilter.addEventListener("change", filterByCategory);

//   const priorityFilter = document.getElementById("priorityFilter");
//   priorityFilter.addEventListener("change", filterByPriority);
// });

// // Attach filter event listeners
// const dueDateFilter = document.getElementById("dueDateFilter");
//   dueDateFilter.addEventListener("change", filterByDueDate);

//   const categoryFilter = document.getElementById("categoryFilter");
//   categoryFilter.addEventListener("change", filterByCategory);

//   const priorityFilter = document.getElementById("priorityFilter");
//   priorityFilter.addEventListener("change", filterByPriority);

renderTodoList();

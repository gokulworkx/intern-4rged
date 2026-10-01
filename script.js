let inputbox=document.querySelector("input");
let addbtn=document.getElementById("addbtn");
let todolist=document.querySelector("ul");
let syntheticE;
let editingIndex;

// localStorage.setItem("todos",JSON.parse([]));
let storedTodo = JSON.parse(localStorage.getItem("todos")) || [];
function handleAddtask(){
    if(inputbox.value.trim().length>0){
        let inputboxvalue=inputbox.value.trim();
        if(addbtn.innerHTML==="Save"){
            storedTodo.splice(editingIndex,1,inputboxvalue);
            localStorage.setItem("todos",JSON.stringify(storedTodo));
            inputbox.value="";
        }else{
            
            console.log(inputboxvalue);
            storedTodo.push(inputboxvalue);
            console.log(storedTodo);
            localStorage.setItem("todos",JSON.stringify(storedTodo))
        }
    }
    todolist.innerHTML="";
    displayTodo();
    inputbox.value="";
}

function displayTodo(){
      storedTodo.forEach((task) => {
        let list = document.createElement("li");
        list.innerHTML =`
        <p class="task">${task}</p>
                <div class="btn-container">
                <button class="edit-btn">Edit</button>
                <button class="delete-btn">Delete</button>
                </div> `;
                todolist.append(list);
                console.log("hi");
      });  
}
displayTodo();

function handleUpdate(e){
    if(e.target.innerHTML == "Delete"){
        console.log(e.target.parentElement.previousElementSibling.innerHTML);
        storedTodo = storedTodo.filter(
        (t,i) => t!=e.target.parentElement.previousElementSibling.innerHTML);

        localStorage.setItem("todos",JSON.stringify(storedTodo));
        todolist.innerHTML="";
        displayTodo(); 
    }else if(e.target.innerHTML=="Edit"){
        storedTodo.find((t,i)=> {
            editingIndex = i;
            return t == e.target.parentElement.previousElementSibling.innerHTML;
        })
        console.log(editingIndex);

        inputbox.value = e.target.parentElement.previousElementSibling.innerHTML;
        addbtn.innerHTML = "Save";

    }

}

addbtn.addEventListener("click",handleAddtask)
todolist .addEventListener("click",handleUpdate);

// function handleAddTask(){
//     if(inputBox.value.trim().length>0){
//         let inputBoxValue=inputBox.value.trim();
//         if(addBtn.innerHTML="Save"){
//             syntheticE.target.parentElement.previousElementSibling.innerHTML=inputBoxValue;
//             addBtn.innerHTML="Add";
//         }else{
//         let list=document.createElement("li");
//         list.innerHTML=`
//         <p class="task">${inputBoxValue}</p>
//                 <div class="btn-container">
//                 <button class="edit-btn">Edit</button>
//                 <button class="delete-btn">Delete</button>
//                 </div>
//         `;
//         todolist.append(list);
//         }
//     }
//     inputBox.value="";
// }

// function handleUpdate(e){
//     if(e.target.innerHTML == "Delete"){
//         e.target.parentElement.parentElement.remove();
//     }else if(e.target.innerHTML=="Edit"){
//         inputBox.value=e.target.parentElement.previousElementSibling.innerHTML;
//         addBtn.innerHTML="Save"
//         syntheticE=e;
//     }
// }

// addBtn.addEventListener("click",handleAddTask)
// addBtn.addEventListener("click",handleUpdate);
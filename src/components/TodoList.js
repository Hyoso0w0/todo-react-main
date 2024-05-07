/* 
  할 일 목록을 관리하고 렌더링하는 주요 컴포넌트입니다.
  상태 관리를 위해 `useState` 훅을 사용하여 할 일 목록과 입력값을 관리합니다.
  할 일 목록의 추가, 삭제, 완료 상태 변경 등의 기능을 구현하였습니다.
*/
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import TodoItem from "@/components/TodoItem";
import styles from "@/styles/TodoList.module.css"; //input안에 텍스트 쓸 수 있음

//firebase 관련 모듈을 불러옵니다.
import {db} from "@/firebase";
import {
  collection,
  query,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  where,
  Timestamp,
} from "firebase/firestore";

//DB의 todos 컬렉션 참조를 만듭니다. 컬렉션 사용시 잘못된 컬렉션 이름 사용을 방지합니다.
const todoCollection = collection(db, "todos");

// TodoList 컴포넌트를 정의합니다.
const TodoList = () => {
  // 상태를 관리하는 useState 훅을 사용하여 할 일 목록과 입력값을 초기화합니다.
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");
  const router = useRouter();
  const { data } = useSession({
    required: true,
    onUnauthenticated() {
      router.replace("/login");
    },
  });
  const [sortByTime, setSortByTime] = useState(false);
  const [category, setCategory] = useState("all");
  
 


  useEffect(()=> {
    console.log("data", data);
    getTodos();
  }, [data, sortByTime, category]);

  const getTodos = async () => {
    // 로그인 정보를 확인하고 사용자 이름이 없으면 함수를 종료합니다.
    if (!data?.user?.name) 
        // 여기에 로그인 정보를 확인하는 코드를 추가하세요.
        // 예를 들어, 로그인 여부를 확인하는 함수를 호출하거나, 사용자 정보를 가져오는 비동기 작업을 수행할 수 있습니다.
        return;
    

    // 사용자 이름에 따라서 쿼리를 설정합니다.
    let q;
    if (sortByTime) {
      q = query(todoCollection, orderBy("createdAt", "desc"));
    } else {
      q = query(todoCollection, orderBy("createdAt", "asc"));
    }

    // 카테고리 옵션에 따라서 쿼리를 추가합니다.
    if (category !== "all") {
      q = query(q, where("category", "==", category));
    }

    // 사용자 이름에 따라서 쿼리를 추가합니다.
    q = query(q, where("userName", "==", data?.user?.name));

    // Firestore에서 할 일 목록을 조회합니다.
    const results = await getDocs(q);

    const newTodos = [];
    // 가져온 할 일 목록을 newTodos 배열에 담습니다.
    results.docs.forEach((doc) => {
      newTodos.push({ id: doc.id, ...doc.data() });
    });

    // setTodos 함수를 사용하여 할 일 목록을 업데이트합니다.
    setTodos(newTodos);
};

  const addTodo = async () => {
    // 입력값이 비어있는 경우 함수를 종료합니다.
    if (input.trim() === "") return;
    
    // Firestore에 현재 시간과 함께 할 일을 추가합니다.
    const currentTime = new Date();
    const docRef = await addDoc(todoCollection, {
      userName: data?.user?.name,
      text: input,
      completed: false,
      createdAt: currentTime, // 등록된 시간을 함께 저장합니다.
      category: category,
    });
  
    // 추가한 할 일을 화면에 표시하기 위해 상태를 업데이트합니다.
    setTodos([...todos, { id: docRef.id, text: input, completed: false, createdAt: currentTime, category: category}]);
    setInput("");

  };


  // toggleTodo 함수는 체크박스를 눌러 할 일의 완료 상태를 변경하는 함수입니다.
  const toggleTodo = (id) => {
    // 할 일 목록에서 해당 id를 가진 할 일의 완료 상태를 반전시킵니다.
    setTodos(
      // todos.map((todo) =>
      //   todo.id === id ? { ...todo, completed: !todo.completed } : todo
      // )
      // ...todo => id: 1, text: "할일1", completed: false
      todos.map((todo) => {
       if(todo.id === id) {
         // Firestore 에서 해당 id를 가진 할 일을 찾아 완료 상태를 업데이트합니다.
         const todoDoc = doc(todoCollection, id);
          updateDoc(todoDoc, { completed: !todo.completed });
          // ...todo => id: 1, text: "할일1", completed: false
          return { ...todo, completed: !todo.completed };
       } else {
        return todo;
       }
      })
    );
  };

 
  // deleteTodo 함수는 할 일을 목록에서 삭제하는 함수입니다.
  const deleteTodo = async (id) => {
    // Firestore 에서 해당 id를 가진 할 일을 삭제합니다.
    const todoDoc = doc(todoCollection, id);
    await deleteDoc(todoDoc);
    setTodos(todos.filter((todo) => todo.id !== id));


    // 해당 id를 가진 할 일을 제외한 나머지 목록을 새로운 상태로 저장합니다.
    // setTodos(todos.filter((todo) => todo.id !== id));
   

  };

const deleteAll = async () => {
  try {
    // Firestore에서 모든 할 일 문서를 가져옵니다.
    const querySnapshot = await getDocs(todoCollection);

    // 모든 할 일 문서를 개별적으로 삭제합니다.
    querySnapshot.forEach((doc) => {
      deleteDoc(doc.ref);
    });

    // 모든 할 일이 삭제된 후에 할 일 목록을 빈 배열로 설정합니다.
    setTodos([]);
  } catch (error) {
    console.error("Error deleting documents: ", error);
  }
};
  

  // 컴포넌트를 렌더링합니다.
  return (
    <div className={styles.container}>
      <h1> {data?.user?.name}'s Todo List</h1>
      {/* 할 일을 입력받는 텍스트 필드입니다. */}
      <input
        type="text"
        className={styles.itemInput}
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      {/* 할 일을 추가하는 버튼입니다. */}
      <button className={styles.addButton} onClick={addTodo}>
        Add Todo
      </button>

      <button className={styles.addButton} onClick={deleteAll}>
  Delete all
</button>
<button className={styles.addButton} onClick={() => setSortByTime(!sortByTime)}>
        {sortByTime ? "Sort by Creation Time (오름차순)" : "Sort by Creation Time (내림차순)"}
      </button>
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="all">All</option>
        <option value="work">Work</option>
        <option value="personal">Personal</option>
        <option value="shopping">Shopping</option>
        {/* Add more categories here if needed */}
      </select>
      {/* 할 일 목록을 렌더링합니다. */}
     
      <ul>
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={() => toggleTodo(todo.id)}
            onDelete={() => deleteTodo(todo.id)}
            createdAt={todo.createdAt instanceof Timestamp ? todo.createdAt.toDate() : todo.createdAt}
          />
          
        ))}
        
      </ul>
    </div>
  );
};

export default TodoList;
const app = Vue.createApp({
    data() {
        return {
            newTask: "",
            tasks: []
        };
    },
    methods: {
        // Obtener todas las tareas desde FastAPI
        async fetchTasks() {
            try {
                const response = await fetch("http://127.0.0.1:8000/tareas");
                if (!response.ok) throw new Error("Error al obtener tareas");
                this.tasks = await response.json();
            } catch (error) {
                console.error(error);
            }
        },
        // Agregar una nueva tarea
        async addNewTask() {
            if (!this.newTask.trim()) return; // No permitir tareas vacías
            try {
                const response = await fetch("http://127.0.0.1:8000/tareas", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ title: this.newTask })
                });
                if (!response.ok) throw new Error("Error al agregar tarea");
                const newTask = await response.json();
                this.tasks.push(newTask);
                this.newTask = "";
            } catch (error) {
                console.error(error);
            }
        },
        // Eliminar una tarea
        async removeTask(taskId) {
            try {
                const response = await fetch(`http://127.0.0.1:8000/tareas/${taskId}`, { method: "DELETE" });
                if (!response.ok) throw new Error("Error al eliminar tarea");
                this.tasks = this.tasks.filter(task => task.id !== taskId);
            } catch (error) {
                console.error(error);
            }
        }
    },
    mounted() {
        this.fetchTasks(); // Cargar tareas al iniciar la app
    }
});

app.component("todo-item", {
    template: `
    <li>
        {{ title }}
        <button @click="$emit('remove')">Remover</button>
    </li>
    `,
    props: ["title"]
});

app.mount("#todo-list");

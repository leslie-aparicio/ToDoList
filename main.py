from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal, Task
from pydantic import BaseModel

app = FastAPI()

# Dependencia para obtener la BD
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Modelo Pydantic para recibir datos correctamente
class TaskCreate(BaseModel):
    title: str

class TaskResponse(TaskCreate):
    id: int

# 📌 Obtener todas las tareas
@app.get("/tareas", response_model=list[TaskResponse])
def get_tasks(db: Session = Depends(get_db)):
    return db.query(Task).all()

# 📌 Agregar una nueva tarea
@app.post("/tareas", response_model=TaskResponse)
def add_task(task: TaskCreate, db: Session = Depends(get_db)):
    new_task = Task(title=task.title)
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return new_task

# 📌 Eliminar una tarea
@app.delete("/tareas/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Tarea no encontrada")
    db.delete(task)
    db.commit()
    return {"message": "Tarea eliminada"}

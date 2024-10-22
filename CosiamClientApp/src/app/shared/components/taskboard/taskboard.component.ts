import { Component, ViewEncapsulation, ViewChild, ElementRef, ChangeDetectionStrategy, ChangeDetectorRef, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { TaskBoardService } from './taskboard.service';
import { CrudModalComponent } from './crud-modal/crud-modal.component';
import { Task } from 'app/models/taskboard.model';

@Component({
  selector: 'app-taskboard',
  templateUrl: './taskboard.component.html',
  styleUrls: ['./taskboard.component.scss'],
  providers: [TaskBoardService],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskboardComponent implements OnInit {

  @ViewChild('marketingTitle') titleInputRef: ElementRef;
  @ViewChild('marketingMessage') messageInputRef: ElementRef;

  BAG = 'task-group';

  tasks: Task[];
  generaliTasks: Task[];
  acquistiTasks: Task[];
  hseTasks: Task[];
  personaleTasks: Task[];

  constructor(private elRef: ElementRef,
    private taskBoardService: TaskBoardService, private modalService: NgbModal,
    private ref: ChangeDetectorRef) {
   this.tasks = this.taskBoardService.tasks;
   this.loadTasks();
 }


 loadTasks() {
  this.generaliTasks = this.tasks.filter((task: Task) => task.status === 'Generali');
  this.acquistiTasks = this.tasks.filter((task: Task) => task.status === 'Acquisti');
  this.hseTasks = this.tasks.filter((task: Task) => task.status === 'HSE');
  this.personaleTasks = this.tasks.filter((task: Task) => task.status === 'Personale');
  this.ref.markForCheck();
}

editTask(task: Task) {
  const modalRef = this.modalService.open(CrudModalComponent);
  modalRef.componentInstance.id = task.taskId; // should be the id
  modalRef.componentInstance.data = { title: task.taskTitle, message: task.taskMessage, type: task.status }; // should be the data

  modalRef.result.then((result) => {

    task.taskTitle = result.title;
    task.taskMessage = result.message;
    task.status = result.type;

    this.updateTaskStatus(task.taskId.toString(), task.status, task);


  }).catch((error) => {
    console.log(error);
  });
}

updateTaskStatus(id: string, status: string, task?: Task) {
  let badgeClass = 'primary';

  if (status === 'Generali') {
    badgeClass = 'primary'
  } else if (status === 'Acquisti') {
    badgeClass = 'warning'
  } else if (status === 'HSE') {
    badgeClass = 'success'
  } else if (status === 'Personale') {
    badgeClass = 'info'
  }

  let currentTask: Task;

  if (task) {
    currentTask = task;
  } else {
    currentTask = this.tasks.find(x => x.taskId === +id);
  }

  const index = this.tasks.indexOf(currentTask);
  currentTask.status = status;
  currentTask.badgeClass = badgeClass;
  this.tasks.splice(index, 1, currentTask);
  this.tasks = [...this.tasks];
  this.loadTasks();
}

deleteTask(id: number) {
  const task: Task = this.tasks.find(x => x.taskId === id);
  const index = this.tasks.indexOf(task);
  this.tasks.splice(index, 1);
  this.tasks = [...this.tasks];
  this.loadTasks();
}

addTask() {
  const modalRef = this.modalService.open(CrudModalComponent);
  modalRef.componentInstance.id = 0; // should be the id
  modalRef.componentInstance.data = { title: '', message: '', type: 'Generali' }; // should be the data

  modalRef.result.then((result) => {
    this.taskBoardService.addNewTask(result.title, result.message, result.type).subscribe(data => {
      this.tasks = data;
      this.loadTasks();
    });
  }).catch((error) => {
    console.log(error);
  });
}


  ngOnInit(): void {
  }

}

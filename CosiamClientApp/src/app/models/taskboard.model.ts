import { NgbCalendar, NgbDate } from '@ng-bootstrap/ng-bootstrap';

/**
 * taskId = id colorato della nota
 * taskTitle = colore dell'id della nota
 * badgeClass = Testo della nota
 *
 */
export class Task {
    // data: NgbDate;


    public taskId: number;
    public taskTitle: string;
    public badgeClass: string
    public taskMessage: string;
    public messageType: string; // text, image
    public messageCount: string;
    public linkCount: string;
    public createdOn: string;
    public createdBy: string;
    public assignedTo: any;
    public isUserImg: boolean;
    public status: string; // categoria di appartenenza

    constructor(
      // private calendar: NgbCalendar,
       taskId: number, taskTitle: string, badgeClass: string, taskMessage: string, messageType: string, messageCount: string, linkCount: string, createdOn: string, createdBy: string, assignedTo: any, isUserImg: boolean, status: string) {
      // this.data=calendar.getToday();
      this.taskId = taskId;
      this.taskTitle = taskTitle;
      this.badgeClass = badgeClass;
      this.taskMessage = taskMessage;
      this.messageType = messageType;
      this.messageCount = messageCount;
      this.linkCount = linkCount;
      this.createdOn = createdOn;
      this.createdBy = createdBy;
      this.assignedTo = assignedTo;
      this.isUserImg = isUserImg;
      this.status = status;
    }
  }

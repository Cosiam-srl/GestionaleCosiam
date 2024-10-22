import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

export interface TableColumn {
  name: string;
  cellStyle?: string;
}

export interface TableDataRow {
  [columnName: string]: {
    title: string,
    value: string,
    format: 'date' | 'datetime' | 'string' | 'number' | 'currency'
    titleClasses?: string,
    titleStyles?: string,
    readonly?: boolean
  };
}

@Component({
  selector: 'app-editable-grid-mini',
  templateUrl: './editable-grid-mini.component.html',
  styleUrls: ['./editable-grid-mini.component.scss']
})
export class EditableGridMiniComponent implements OnInit {
  editMode = false;
  allowedEditFormats:string[];
  @Input() valid? = true;
  @Input() columns: TableColumn[];
  @Input() data: TableDataRow[];
  @Output() dataChange = new EventEmitter<TableDataRow[]>();
  //@Output() valueChange = new EventEmitter<ValueChangeEvent>();

  constructor() {
    this.allowedEditFormats = [ 'string', 'number', 'currency' ];
  }

  ngOnInit(): void {
    
  }

  onToggleEditMode() {

  }

  onCancel() {

  }

  onChangesConfirm() {

  }

  allowedFormat(format: string) {
    if(!format)
      return false;

    return this.allowedEditFormats.indexOf(format) >= 0;
  }

  onEdit(row: TableDataRow, column: TableColumn, ctrlName: string, event) {
    let newValue = event.target.value;
    
    row[column.name].value = newValue;
    this.dataChange.emit(this.data);
  }

}

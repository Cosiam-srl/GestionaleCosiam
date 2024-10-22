import { NgModule } from '@angular/core';
import {CommonModule} from '@angular/common';

import { FilterPipe } from './filter.pipe';
import { SearchPipe } from './search.pipe';
import { ShortNamePipe } from './short-name.pipe';
import { TaggedPersonalePipe } from './tagged-personale.pipe';
import { DataPipe } from './date.pipe';
import { DataToStringPipe } from './datetostring.pipe';
import { TagliastringaPipe } from './tagliastringa.pipe';
import { TruncatePipePipe } from './truncate-pipe.pipe';
import { TableRowFormatterPipe } from './table-row-formatter.pipe';

@NgModule({
  declarations: [FilterPipe, SearchPipe, ShortNamePipe, TaggedPersonalePipe, DataPipe, DataToStringPipe, TagliastringaPipe, TruncatePipePipe, TableRowFormatterPipe],
  imports: [CommonModule],
  exports: [FilterPipe, SearchPipe, ShortNamePipe, TaggedPersonalePipe, DataPipe, DataToStringPipe, TagliastringaPipe, TruncatePipePipe, TableRowFormatterPipe]
})

export class PipeModule {}

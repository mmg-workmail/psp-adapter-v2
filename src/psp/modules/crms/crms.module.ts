import { Module } from '@nestjs/common';

import { BractagonModule } from 'src/psp/modules/crms/modules/bractagon/bractagon.module';

@Module({
    imports: [BractagonModule]
})
export class CrmsModule { }

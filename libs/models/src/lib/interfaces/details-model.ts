import { RailHandlingType, PageComponent } from './../../index';

export interface QueueItem {
    railId: string;
    component: PageComponent;
    railHandlingType: RailHandlingType | null;
    relatedContentTitle: string;
}

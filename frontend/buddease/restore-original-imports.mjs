import { writeFileSync } from 'fs';
import { resolve } from 'path';

const filePath = resolve(process.cwd(), 'src/app/snapshots/snapshotContainerUtils.ts');

const content = `import { additionalHeaders } from '@/app/api/headers/generateAllHeaders';
import createSnapshot, * as snapshotApi from '@/app/api/SnapshotApi';
import { Category, generateCategoryProperties, isCategoryProperties } from '@/app/components/libraries/categories/generateCategoryProperties';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { StructuredMetadata } from '@/app/config/StructuredMetadata';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { dataStoreMethods } from "@/app/models/data/dataStoreMethods";
import { CategoryProperties, convertToCategoryProperties } from '@/app/pages/personas/ScenarioBuilder';
import { CriteriaType } from '@/app/pages/searches/CriteriaType';
import { criteria } from '@/app/pages/searches/FilterCriteria';
import { ConfigureSnapshotStorePayload, data, Snapshot, SnapshotConfig, SnapshotContainer, SnapshotData, SnapshotStoreProps } from '@/app/snapshots';
import SnapshotStore from '@/app/snapshots/SnapshotStore';
import { createSnapshotStoreConfig } from '@/app/snapshots/snapshotStoreConfigInstance';
import { storeProps } from '@/app/snapshots/SnapshotStoreProps';
import CalendarManagerStoreClass from '@/app/state/stores/CalendarManagerStore';
import { DataStore } from "@/app/state/stores/DataStore";
import { store } from '@/app/state/stores/useAppDispatch';
import { payload } from '@/app/subscribers/Subscriber';
import { SnapshotEvent } from '@/app/typings/snapshotTypes';
import { RealtimeDataItem } from '@/app/typings/realtimeTypes';
import { category, snapshotId } from '@/utils/snapshotUtils';
import { callback } from 'chart.js/helpers';
import { id } from 'ethers';
import { snapshot } from '.';
import { handleSnapshotOperation } from "./handleSnapshotOperation";
import { snapshotStoreConfigInstance } from "./snapshotStoreConfigInstance";`;

writeFileSync(filePath, content);
console.log('✅ Restored original imports with @/app prefixes');

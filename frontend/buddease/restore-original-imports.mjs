import { writeFileSync } from 'fs';
import { resolve } from 'path';

const filePath = resolve(process.cwd(), 'src/app/snapshots/snapshotContainerUtils.ts');

const content = `import { additionalHeaders } from '@/core/api/headers/generateAllHeaders';
import createSnapshot, * as snapshotApi from '@/core/api/SnapshotApi';
import { Category, generateCategoryProperties, isCategoryProperties } from '@/core/components/libraries/categories/generateCategoryProperties';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import { StructuredMetadata } from '@/core/config/StructuredMetadata';
import { Attachment } from '@/core/documents/attachment/Attachment';
import { dataStoreMethods } from "@/core/models/data/dataStoreMethods";
import { CategoryProperties, convertToCategoryProperties } from '@/core/pages/personas/ScenarioBuilder';
import { CriteriaType } from '@/core/pages/searches/CriteriaType';
import { criteria } from '@/core/pages/searches/FilterCriteria';
import { ConfigureSnapshotStorePayload, data, Snapshot, SnapshotConfig, SnapshotContainer, SnapshotData, SnapshotStoreProps } from '@/core/snapshots';
import SnapshotStore from '@/core/snapshots/SnapshotStore';
import { createSnapshotStoreConfig } from '@/core/snapshots/snapshotStoreConfigInstance';
import { storeProps } from '@/core/snapshots/SnapshotStoreProps';
import CalendarManagerStoreClass from '@/core/state/stores/CalendarManagerStore';
import { DataStore } from "@/core/state/stores/DataStore";
import { store } from '@/core/state/stores/useAppDispatch';
import { payload } from '@/core/subscribers/Subscriber';
import { SnapshotEvent } from '@/core/typings/snapshotTypes';
import { RealtimeDataItem } from '@/core/typings/realtimeTypes';
import { category, snapshotId } from '@/utils/snapshotUtils';
import { callback } from 'chart.js/helpers';
import { id } from 'ethers';
import { snapshot } from '.';
import { handleSnapshotOperation } from "./handleSnapshotOperation";
import { snapshotStoreConfigInstance } from "./snapshotStoreConfigInstance";`;

writeFileSync(filePath, content);
console.log('✅ Restored original imports with @/core prefixes');

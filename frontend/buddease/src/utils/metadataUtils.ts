// metadataUtils.ts
import { contentApiService } from '@/core/api/service/ContentApiService';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import { StructuredMetadata } from "@/core/config/StructuredMetadata";
import { Attachment } from '@/core/documents/attachment/Attachment';
import { CategoryKeys, getCategoryProperties } from '@/core/libraries/categories/CategoryManager';
import SnapshotStore from '@/core/snapshots/SnapshotStore';
import nlp from 'compromise'; // lightweight NLP library
import { ContentState } from "draft-js";
import Sentiment from 'sentiment';

/**
 * Generate structured metadata for a specific content item
 */

const sentimentAnalyzer = new Sentiment();

async function getMetadataForContent<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  contentId: string,
  content: string
): Promise<StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {

  // --- NLP keyword extraction ---
  const doc = nlp(content);
  const nouns = doc.nouns().out('array');
  const verbs = doc.verbs().out('array');
  const keywords = Array.from(new Set([...nouns, ...verbs])).slice(0, 20); // top 20 unique keywords

  // --- Sentiment analysis ---
  const sentimentResult = sentimentAnalyzer.analyze(content);
  const sentimentScore = sentimentResult.score;
  const sentiment = sentimentScore > 0 ? 'positive' : sentimentScore < 0 ? 'negative' : 'neutral';

  // --- Content stats ---
  const words = content.split(/\s+/);
  const wordCount = words.length;
  const uniqueWordsCount = new Set(words).size;

  // --- Category assignment ---
  const allCategoryKeys = Object.keys((await import('@/core/models/data/DataStructureCategories')).allCategories) as CategoryKeys[];
  let bestCategory: CategoryKeys = allCategoryKeys[0];
  let maxMatches = 0;

  allCategoryKeys.forEach(catKey => {
    const catProps = getCategoryProperties(catKey);
    const matches = keywords.filter(k => catProps.name.toLowerCase().includes(k.toLowerCase())).length;
    if (matches > maxMatches) {
      maxMatches = matches;
      bestCategory = catKey;
    }
  });

  const categoryProperties = getCategoryProperties(bestCategory);

  // --- Related content / attachments ---
  let relatedContents: any[] = [];
  try {
    const searchResults = await contentApiService.searchContents({ limit: 5, contentType: 'all', sortOrder: 'desc' });
    // Simple similarity: include any content that shares at least one keyword
    relatedContents = searchResults.contents.filter(c =>
      keywords.some(k => c.content.includes(k))
    );
  } catch (err) {
    console.error('Failed to fetch related content:', err);
  }

  // --- Construct metadata object ---
  const metadata: StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
    id,
    category: bestCategory,
    categoryProperties,
    keywords,
    sentiment,
    sentimentScore,
    stats: {
      wordCount,
      uniqueWordsCount,
    },
    relatedContents,
    createdAt: new Date(),
    updatedAt: new Date(),
    authorId: undefined,
    attachments: [],
    additionalData: {},
  };

  return metadata;
}

  
  
async function getMetadataFromPlainText<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T ,
  >(
    contentId: string,
  contentState: ContentState,
): Promise<StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
    const contentString = contentState.getPlainText();
    return await getMetadataForContent(contentId, contentString);
  }

/**
 * Checks if a SnapshotStore instance contains "unified" metadata,
 * i.e., StructuredMetadata with expected fields like metadataEntries or startDate
 */
function isUnifiedMetaDataOptions<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T,
>(snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): snapshotStore is SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  if (!snapshotStore || !snapshotStore.metadata) return false;
  return 'metadataEntries' in snapshotStore.metadata || 'startDate' in snapshotStore.metadata;
}

/**
 * Type guard to check if metadata is a generic record (not unified metadata)
 */
function isGenericMetadata<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T,
>(
  snapshotStore: SnapshotStore<T, K, any, AttachmentType, ExcludedFields, IncludedFields>
): snapshotStore is SnapshotStore<T, K, Record<string, any>, AttachmentType, ExcludedFields, IncludedFields> {
  return !isUnifiedMetaDataOptions(snapshotStore);
}
  
  export { getMetadataForContent, getMetadataFromPlainText, isGenericMetadata, isUnifiedMetaDataOptions };

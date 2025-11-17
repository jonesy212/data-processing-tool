import { BaseData, Data } from '@/app/models/data/Data';
import { DetailsItem } from "@/app/state/stores/DetailsListStore";


// Define a new type for DetailsItem with all properties of Data, but make them optional
type DetailsItemAll<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> = DetailsItem<Partial<AllProperties<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>>;

interface DetailsListItemProps<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  item: DetailsItemAll<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  label: string;
  value: string;
}

const DetailsListItem = <
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>({ item, label, value }: DetailsListItemProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
  return (
    <div>
      <h3>{label}</h3>
      <p>{value}</p>
      <h3>{item.title}</h3>
      <p>{item.description}</p>
      {/* Render other item details as needed */}
    </div>
  );
};

export default DetailsListItem;
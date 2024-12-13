import { BaseData } from '@/app/components/models/data/Data';
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { Snapshot } from "../components/snapshots";
import { SnapshotCategory, SnapshotCategoryType } from "./getSnapshotEndpoint";

class SnapshotCategoryManager <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>> {
    private categories: SnapshotCategory<T, K>[] = [];

    // Add a new category
    addCategory(name: SnapshotCategoryType, description?: string): SnapshotCategory<T, K> {
        const newCategory: SnapshotCategory<T, K> = {
            id: this.generateId(),
            name,
            description,
            snapshots: []
        };
        this.categories.push(newCategory);
        return newCategory;
    }

    // Add a snapshot to a category
    addSnapshotToCategory(categoryId: string, snapshot: Snapshot<T, K>): boolean {
        const category = this.categories.find(cat => cat.id === categoryId);
        if (category) {
            category.snapshots.push(snapshot);
            return true;
        }
        return false; // Category not found
    }

    // Remove a snapshot from a category
    removeSnapshotFromCategory(categoryId: string, snapshotId: string): boolean {
        const category = this.categories.find(cat => cat.id === categoryId);
        if (category) {
            category.snapshots = category.snapshots.filter(snap => snap.id !== snapshotId);
            return true;
        }
        return false; // Category not found
    }

    // Retrieve all snapshots in a category
    getSnapshotsInCategory(categoryId: string): Snapshot<T, K>[] | null {
        const category = this.categories.find(cat => cat.id === categoryId);
        return category ? category.snapshots : null;
    }

    // Helper method to generate unique IDs (simplified)
    private generateId(): string {
        return (Math.random() * 1e9).toString(36);
    }
}

export default SnapshotCategoryManager
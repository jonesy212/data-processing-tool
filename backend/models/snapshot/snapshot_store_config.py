from datetime import datetime
from typing import Dict, List, Union

from authentication.auth import authentication


class SnapshotStoreConfig:
    def __init__(self, key: str, initial_state: dict, on_snapshot=None, snapshot=None):
        self.key = key
        self.initial_state = initial_state
        self.on_snapshot = on_snapshot
        self.snapshot = snapshot

    def configure_snapshot_store(self):
        print("Configuring SnapshotStore...")
        if self.snapshot:
            self.snapshot()
        print("SnapshotStore configuration successful.")

class Snapshot:
    def __init__(self, timestamp: int, data: Union[user_data, Data], snapshot):
        self.timestamp = timestamp
        self.data = data
        self.snapshot = snapshot
        self.snapshots = []

    def init_snap_shot(self, snapshot):
        self.take_snapshot(snapshot)

    def take_snap_shot(self, data):
        self.snapshot = data

    def update_snapshot(self, snapshot):
        current_snapshot = snapshot
        previous_snapshot = self.snapshots[-1]
        previous_snapshot.snapshots.append(current_snapshot)


class SnapshotStore:
    def __init__(self, config: SnapshotStoreConfig):
        self.key = config.key
        self.state = config.initial_state
        self.on_snapshot = config.on_snapshot
        self.snapshot = config.snapshot
        self.snapshots = []

    def init_snap_shot(self, snapshot):
        self.take_snapshot(snapshot)

    def update_snapshot(self, new_snapshot):
        self.state = new_snapshot
        if self.snapshot:
            self.snapshot()

    def take_snapshot(self, data):
        timestamp = int(datetime.time() * 1000)
        snapshot = Snapshot(timestamp, data, {})
        self.snapshots.append(snapshot)

    def fetch_snapshot(self, snapshot):
        self.snapshots.append(snapshot)

    def get_snapshot(self, snapshot_id):
        return next((snap for snap in self.snapshots if snap.timestamp == snapshot_id), None)

    def get_snapshots(self, snapshot_ids):
        return [self.get_snapshot(snapshot_id) for snapshot_id in snapshot_ids]

    def clear_snapshots(self):
        self.snapshots = []

    def get_all_snapshots(self):
        return [snapshot.data for snapshot in self.snapshots]

    def get_latest_snapshot(self, snapshot):
        return self.snapshots[-1].snapshot

    def take_latest_snapshot(self, snapshot):
        timestamp = int(datetime.time() * 1000)
        auth_state = authentication()  # Implement use_auth function accordingly
        data = auth_state if isinstance(auth_state, (UserData, Data)) else Data()  # Adjust as needed
        self.snapshots = [
            Snapshot(
                timestamp=timestamp,
                data=data,
                snapshot=snapshot,
                snapshots=[],
                init_snap_shot=lambda snapshot: self.take_snapshot(snapshot),
                take_snap_shot=lambda data: self.take_latest_snapshot(data),
                update_snapshot=lambda data: self.update_snapshot(data),
            )
        ]


# Example usage
config = SnapshotStoreConfig(key="todos", initial_state={}, on_snapshot=lambda snapshot: print(snapshot))
snapshot_store = SnapshotStore(config)
snapshot_store.configure_snapshot_store()

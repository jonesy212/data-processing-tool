🎥 Video Data Architecture

This document explains the structure, purpose, and relationships between core entities and functions used in the video management logic.
It defines how raw video data flows from the backend or UI into the application store, gets transformed into enriched state, and is accessed or updated.

🧩 Core Concepts
Concept	Type	Purpose	Example Use
Video	Base entity	Represents a simple, raw video object retrieved from an API or created via UI.	Data from API, form submission, etc.
VideoData<T>	Rich entity	Extends Video with metadata, timestamps, computed fields, and tracking information.	Used for rendering, caching, and state management.
convertToVideoData	Transformer Function	Converts a raw Video into a rich VideoData<T> before storage or processing.	Ensures consistent format in the store.
videos (state)	Record<string, VideoData[]>	Centralized collection of enriched video entries, keyed by ID or category.	Provides fast access and grouping in UI.
getVideoData	Accessor Function	Retrieves a single VideoData entry from store memory.	Used when editing or playing a video.
getVideosData	Remote Accessor Function	Fetches videos from a remote source and converts them via convertToVideoData.	Used for syncing or refreshing from backend.
🧠 Concept Flow
graph TD
  A[API Response / User Input (Video)] --> B[convertToVideoData()]
  B --> C[VideoData<T>]
  C --> D[Store (videos: Record<string, VideoData[]>)]
  D --> E[getVideoData / getVideosData]
  E --> F[UI Components / Views]


Step 1: The raw Video object is fetched or received from user input.

Step 2: convertToVideoData standardizes and enriches the object (adding timestamps, metadata, etc.).

Step 3: The enriched object is stored in a centralized videos state.

Step 4: Accessor functions like getVideoData or getVideosData retrieve this information.

Step 5: The UI layer uses the enriched data for rendering, editing, or playback.

🧰 Function Responsibilities
convertToVideoData(video: Video): VideoData<T>

Transforms a raw Video into a structured, enriched VideoData object.

Example:

const videoData = convertToVideoData(apiVideo);

getVideoData(id: string): VideoData<T> | null

Returns a single enriched VideoData object by ID.

Example:

const videoInfo = getVideoData("abc123");

getVideosData(ids: string[], videoList: VideoData[]): Promise<Record<string, VideoData<T>>>

Fetches and converts multiple videos by IDs from the server, ensuring local state consistency.

Example:

const remoteVideos = await getVideosData(["a1", "a2"], existingVideos);

🏗️ State Structure Overview
{
  videos: {
    "category1": [VideoData, VideoData, ...],
    "category2": [VideoData, ...],
  },
  video: VideoData | null,
  currentMeta: MetaData | null,
  currentMetadata: MetaData | null,
  date: Date | null
}


This structure provides:

Quick lookup for videos by category or ID.

Reactive updates through React’s state or MobX observables.

Metadata tracking for richer context and operational intelligence.

🧭 Data Lifecycle Summary
Phase	Operation	Function(s)	Result
Fetch	Retrieve raw video(s) from API	fetchVideos, getVideosData	Video[]
Transform	Convert to enriched data	convertToVideoData	VideoData<T>
Store	Save to state/store	setVideos, addVideo, updateVideo	Centralized store
Access	Retrieve and use	getVideoData, getVideosData	Render or edit
Update	Modify metadata/tags	updateVideoTags	Updated state
Delete	Remove video from store/backend	deleteVideo	Clean state



🎬 Video Store Architecture & Logic Overview

This document provides a complete breakdown of the video management flow — from fetching and converting raw videos to updating and synchronizing enriched video data within the application store.

It maps directly to your code structure inside the generic useVideoStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>() hook.

🧩 Core Entities & Roles
Concept	Type	Purpose	Example Use
Video	Base entity	Represents a simple, raw video object.	API response or UI form
VideoData<T>	Rich entity	Enriched version of Video with metadata, timestamps, and contextual info.	Used in store and UI.
convertToVideoData	Transformer	Converts a raw Video → VideoData<T>.	Before saving to store.
videos (state)	Record<string, VideoData[]>	Centralized map of enriched videos keyed by ID or category.	Core store structure.
getVideoData	Accessor	Retrieves a single video by ID.	Editing or playback.
getVideosData	Remote accessor	Fetches and enriches multiple videos.	Syncing with backend.
updateVideo	Updater	Replaces a specific video entry in the store.	After edit/save.
deleteVideo	Remover	Deletes a video from store & backend.	On remove action.
updateVideoTags	Tag editor	Updates tags array for an existing video.	On metadata update.
handleError	Error handler	Logs, notifies, and sets error state.	Across all async calls.
🧠 Data Flow Diagram
graph TD
  A[API Response / UI Form (Video)] --> B[convertToVideoData()]
  B --> C[VideoData<T>]
  C --> D[Store: videos Record<string, VideoData[]>]
  D --> E[getVideoData / getVideosData]
  E --> F[UI (Player / Editor / Dashboard)]
  F --> G[User Action: Edit, Delete, Tag Update]
  G --> H[updateVideo / deleteVideo / updateVideoTags]
  H --> D

Flow Summary:

Input Phase: Raw Video arrives via API or UI.

Transform Phase: Converted into VideoData for uniform state handling.

Store Phase: Persisted in the videos state (central registry).

Access Phase: Queried through accessor functions.

Update Phase: User actions modify data; state updates and syncs.

🏗️ State Composition
{
  videos: Record<string, VideoData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>,
  video: VideoData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
  isLoading: boolean,
  error: string | null,
  currentMeta: any,
  currentMetadata: any,
  date: Date | null
}

State Field	Purpose	Updated By
videos	Centralized video storage keyed by ID/category.	fetchVideos, addVideo, updateVideo, deleteVideo.
video	Currently focused video object.	setVideo.
isLoading	Indicates active fetch/operation state.	All async handlers.
error	Contains last operation error message.	handleError.
currentMeta	Active metadata object.	setCurrentVideoMeta.
currentMetadata	Additional metadata detail.	setCurrentVideoMetadata.
date	Timestamp for current context.	setCurrentVideoDate.
⚙️ Function Reference
🔹 fetchVideos()

Fetches all videos from the backend, converts them, and populates the store.

const fetchVideos = async () => {
  setIsLoading(true);
  setError(null);
  try {
    const response = await fetch(endpoints.videos.list.toString());
    if (!response.ok) throw new Error("Failed to fetch videos");

    const data = await response.json();
    const videoData = Object.keys(data).reduce((acc, key) => {
      acc[key] = data[key].map((v: Video) =>
        convertToVideoData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(v)
      );
      return acc;
    }, {} as Record<string, VideoData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>);

    setVideos(videoData);
  } catch (error) {
    handleError(error, "fetching videos");
  } finally {
    setIsLoading(false);
  }
};

🔹 getVideoData(id: string)

Retrieves a single video by ID.
If not found, can optionally convert a provided raw Video.

const getVideoData = (id: string, _video?: Video) => {
  const videoEntry = videos[id]?.find((v) => v.id === id);
  return videoEntry || (_video ? convertToVideoData(_video) : null);
};

🔹 getVideosData(ids: string[], videoList: VideoData[])

Fetches multiple videos by ID, merges with local state.

const getVideosData = async (ids: string[], videoList: VideoData[]) => {
  try {
    const response = await axiosInstance.get("/videos", {
      params: { ids, videos: videoList.map((v) => v.id) },
    });

    const data = response.data as Record<string, Video[]>;
    const converted: Record<string, VideoData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> = {};

    for (const key in data) {
      converted[key] = convertToVideoData(data[key][0]);
    }

    return converted;
  } catch (error) {
    handleError(error, "fetching videos data");
    return {};
  }
};

🔹 addVideo(video: Video)

Adds a single video to the store and notifies success.

const addVideo = (video: Video) => {
  const videoData = convertToVideoData(video);
  setVideos((prev) => ({ ...prev, [video.id]: [videoData] }));

  notify(
    null,
    "Video added successfully",
    NOTIFICATION_MESSAGES.Video.ADD_VIDEO_SUCCESS,
    new Date(),
    NotificationTypeEnum.OPERATION_SUCCESS
  );
};

🔹 updateVideo(id: string, updatedVideo: Video)

Updates an existing video entry by ID.

const updateVideo = (id: string, updatedVideo: Video) => {
  const videoData = convertToVideoData(updatedVideo);
  setVideos((prev) => ({ ...prev, [id]: [videoData] }));

  notify(
    null,
    "Video updated successfully",
    NOTIFICATION_MESSAGES.Video.UPDATE_VIDEO_SUCCESS,
    new Date(),
    NotificationTypeEnum.OPERATION_SUCCESS
  );
};

🔹 deleteVideo(id: string)

Removes a video locally and remotely.

const deleteVideo = async (id: string) => {
  setVideos((prev) => {
    const updated = { ...prev };
    delete updated[id];
    return updated;
  });

  const response = await axiosInstance.delete(`${endpoints.videos.deleteVideo}${id}`);

  notify(
    null,
    `You have successfully deleted the video ${id}`,
    NOTIFICATION_MESSAGES.Video.DELETE_VIDEO_SUCCESS,
    new Date(),
    NotificationTypeEnum.OPERATION_SUCCESS
  );
};

🔹 updateVideoTags(id: string, tags: string[])

Updates the tag list for a given video.

const updateVideoTags = (id: string, tags: string[]) => {
  setVideos((prev) => {
    const updated = prev[id] ? [...prev[id]] : [];
    const video = updated.find((v) => v.id === id);
    if (video) video.tags = tags;
    return { ...prev, [id]: updated };
  });
};

🔹 handleError(error, action)

Centralized error handler to log and trigger notifications.

const handleError = (error: any, action: string) => {
  console.error(`Error ${action}:`, error);
  setError(`Error ${action}: ${error.message || "Unknown error"}`);
  notify(
    `Error ${action}`,
    error.message || "Unknown error",
    "Failed to perform action",
    new Date(),
    NotificationTypeEnum.ERROR
  );
};

🧭 Lifecycle Summary
Phase	Operation	Function(s)	Result
Fetch	Retrieve raw videos from API	fetchVideos, getVideosData	Video[]
Transform	Convert raw → enriched	convertToVideoData	VideoData<T>
Store	Save in state/store	setVideos, addVideo, updateVideo	Centralized state
Access	Retrieve for UI	getVideoData, getVideosData	Display or playback
Update	Modify tags/metadata	updateVideoTags	Synced store
Delete	Remove from backend & state	deleteVideo	Clean store
Error	Handle issues gracefully	handleError	Logged & notified



🕓 Video Store State Lifecycle Timeline

This timeline shows the reactive flow of your useVideoStore hook — when each phase runs, how the store changes, and what user or system event triggers the update.

🧭 Lifecycle Overview
Lifecycle Phase	Trigger Source	Function(s)	Purpose / Effect	Store Updates
Initialization	Component mount or app startup	fetchVideos()	Load initial video data from the backend.	videos, isLoading
Data Access	Component requesting specific video(s)	getVideoData(), getVideosData()	Retrieve one or multiple videos (local or remote).	— (read-only access)
Add / Upload	User uploads a new video	addVideo()	Convert raw video and insert into store.	videos
Update / Edit	User edits video metadata	updateVideo()	Replace existing entry with updated enriched version.	videos
Tag Update	User changes tags or categories	updateVideoTags()	Mutate tags on selected video.	videos
Delete / Remove	User deletes a video	deleteVideo()	Remove video both locally and remotely.	videos
Metadata Management	User focuses or edits metadata	setCurrentVideoMeta(), setCurrentVideoMetadata(), setCurrentVideoDate()	Keep current edit context synchronized.	currentMeta, currentMetadata, date
Error Handling	Any API or conversion failure	handleError()	Log, notify, and set error state.	error
Notification Events	Post-action completion	notify() (inside each op)	Send user-visible feedback messages.	— (UI only)
🔁 Detailed Timeline Flow
sequenceDiagram
    participant UI as User Interface
    participant Store as useVideoStore
    participant API as Backend API
    participant Notifier as Notification System

    Note over Store: 🟢 Initialization Phase
    UI->>Store: Mounts component
    Store->>API: fetchVideos()
    API-->>Store: Returns raw Video[]
    Store->>Store: convertToVideoData() → populate videos state
    Store-->>UI: isLoading=false, videos ready

    Note over Store: 🟣 Access Phase
    UI->>Store: getVideoData(id)
    Store-->>UI: Returns VideoData<T>

    Note over Store: 🟡 Update / Add Phase
    UI->>Store: addVideo(video)
    Store->>Store: convertToVideoData()
    Store->>Notifier: notify("Video added successfully")
    Store-->>UI: videos updated

    UI->>Store: updateVideo(id, updatedVideo)
    Store->>Store: replace existing video entry
    Store->>Notifier: notify("Video updated successfully")

    Note over Store: 🟠 Tag Edit Phase
    UI->>Store: updateVideoTags(id, tags)
    Store->>Store: mutate tags array

    Note over Store: 🔴 Delete Phase
    UI->>Store: deleteVideo(id)
    Store->>API: DELETE /videos/{id}
    API-->>Store: success
    Store->>Notifier: notify("Video deleted successfully")

    Note over Store: ⚠️ Error Phase
    API-->>Store: error response
    Store->>Store: handleError(error, action)
    Store->>Notifier: notify("Error performing action")

🧠 Reactive Triggers (Simplified View)
Trigger	Effect	Function(s) Fired
Component Mount	Load all videos.	fetchVideos()
User Opens a Video	Retrieve one from store.	getVideoData()
User Adds a Video	Convert + Insert.	convertToVideoData(), addVideo()
User Edits a Video	Replace existing.	updateVideo()
User Updates Tags	Mutate tag array.	updateVideoTags()
User Deletes a Video	Remove & notify.	deleteVideo()
Any Error	Capture & display.	handleError()
⚡ Store Synchronization Summary
Reactive Variable	Trigger	Update Source	Propagation
videos	Fetch / Add / Update / Delete	API + Local	Renders video list
video	User selects a video	Local	Current view context
isLoading	Async start/end	Internal	UI spinners/loading states
error	On API or logic failure	handleError()	Alerts / notification banners
currentMeta / currentMetadata / date	On user focus / edit	setCurrentVideoMeta() etc.	Form states / metadata views
🧭 Example Lifecycle Scenario

Scenario: User logs in → opens dashboard → edits video tags.

fetchVideos() runs → loads all data from backend.

getVideoData(id) runs when user opens a video editor.

User edits tags → updateVideoTags() mutates store.

Store updates → React re-renders component instantly.

Notification triggers confirming success.

Any network or type failure routes to handleError() for feedback.
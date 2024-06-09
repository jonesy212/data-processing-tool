// ArticlesList.tsx
import React from "react";
import { observer } from "mobx-react-lite";
import { articleStore } from "./path/to/your/store";

const ArticlesList = observer(() => {
  return (
    <div>
      {articleStore.isLoading ? (
        <p>Loading articles...</p>
      ) : articleStore.error ? (
        <p>{articleStore.error}</p>
      ) : (
        <ul>
          {articleStore.articles.map((article) => (
            <li key={article.id}>{article.title}</li>
          ))}
        </ul>
      )}
    </div>
  );
});

export default ArticlesList;

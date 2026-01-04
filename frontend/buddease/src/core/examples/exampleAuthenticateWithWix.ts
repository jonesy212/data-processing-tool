exampleAuthenticateWithWix.ts

exampleAuthenticateWithWix usage
const pageData: PageData = {
  title: 'New Page',
  layout: 'default',
  components: [],
};

createWebPage(pageData)
  .then((createdPage) => {
    console.log('New page created:', createdPage);
    const updatedContent = {};
    return updateWebPageContent(createdPage.id, updatedContent);
  })
  .then((updatedPage) => {
    console.log('Page content updated:', updatedPage);
    return publishWebPage(updatedPage.id);
  })
  .then((publishedPage) => {
    console.log('Page published successfully:', publishedPage);
  })
  .catch((error) => {
    console.error('Error:', error);
  });
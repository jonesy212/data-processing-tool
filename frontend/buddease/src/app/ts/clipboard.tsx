// Example using clipboard.js
new ClipboardJS('.copy-button', {
    text: function(trigger) {
        return 'Text to be copied';
    }
});

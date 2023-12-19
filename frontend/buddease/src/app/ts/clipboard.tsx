// Example using clipboard.tsx

new Clipboa('.copy-button', {
    text: function(trigger) {
        return 'Text to be copied';
    }
});

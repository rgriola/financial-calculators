// Local storage management for form state

const StorageManager = {
    STORAGE_KEY_PREFIX: 'mortgage_calc_',
    
    // Save form state
    saveFormState: function(formId, data) {
        if (!AppConfig.ui.persistFormState) return;
        
        try {
            const key = this.STORAGE_KEY_PREFIX + formId;
            localStorage.setItem(key, JSON.stringify({
                data: data,
                timestamp: Date.now()
            }));
            AppConfig.log('debug', `Form state saved: ${formId}`, data);
        } catch (error) {
            AppConfig.log('error', 'Failed to save form state', error);
        }
    },
    
    // Load form state
    loadFormState: function(formId, maxAge = 86400000) { // 24 hours default
        try {
            const key = this.STORAGE_KEY_PREFIX + formId;
            const stored = localStorage.getItem(key);
            
            if (!stored) return null;
            
            const parsed = JSON.parse(stored);
            const age = Date.now() - parsed.timestamp;
            
            if (age > maxAge) {
                this.clearFormState(formId);
                return null;
            }
            
            AppConfig.log('debug', `Form state loaded: ${formId}`, parsed.data);
            return parsed.data;
        } catch (error) {
            AppConfig.log('error', 'Failed to load form state', error);
            return null;
        }
    },
    
    // Clear specific form state
    clearFormState: function(formId) {
        const key = this.STORAGE_KEY_PREFIX + formId;
        localStorage.removeItem(key);
    },
    
    // Clear all app data
    clearAll: function() {
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(this.STORAGE_KEY_PREFIX)) {
                localStorage.removeItem(key);
            }
        });
        AppConfig.log('info', 'All stored form states cleared');
    }
};
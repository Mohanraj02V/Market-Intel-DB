import os

filepath = 'src/components/marketEvents/MarketEventForm.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    form_content = f.read()

old_catch = """    } catch (err) {
      let errorMessage = 'An error occurred while saving.';
      if (err.detail) {
        errorMessage = err.detail;
      } else if (typeof err === 'object') {
        const errors = [];
        for (const [field, messages] of Object.entries(err)) {
          const readableKey = field.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
          errors.push(`${readableKey}: ${Array.isArray(messages) ? messages.join(' ') : messages}`);
        }
        errorMessage = errors.join(' | ');
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      setError(errorMessage);
    }"""

new_catch = """    } catch (err) {
      let errorMessage = 'An error occurred while saving.';
      
      const formatDrfError = (obj, parentKey = '') => {
        let msgs = [];
        for (const [key, value] of Object.entries(obj)) {
          const readableKey = key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
          const fullKey = parentKey ? `${parentKey} -> ${readableKey}` : readableKey;
          
          if (Array.isArray(value)) {
            msgs.push(`${fullKey}: ${value.join(' ')}`);
          } else if (typeof value === 'object' && value !== null) {
            msgs = msgs.concat(formatDrfError(value, fullKey));
          } else {
            msgs.push(`${fullKey}: ${value}`);
          }
        }
        return msgs;
      };

      if (err && typeof err === 'object' && !err.message) {
        if (err.detail) {
          errorMessage = err.detail;
        } else {
          const errors = formatDrfError(err);
          errorMessage = errors.join(' | ');
        }
      } else if (typeof err === 'string') {
        errorMessage = err;
      } else if (err && err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    }"""

form_content = form_content.replace(old_catch, new_catch)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(form_content)

print("Updated recursive error formatting in MarketEventForm.jsx")

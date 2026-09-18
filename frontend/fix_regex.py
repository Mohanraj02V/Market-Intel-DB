import re

filepath = 'src/components/prospects/ProspectForm.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    form_content = f.read()

# Use regex to find the catch block and replace it
import re

pattern = re.compile(r'\} catch \(err\) \{.*setError\(errorMessage\);\s*\}', re.DOTALL)

new_catch = """} catch (err) {
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

new_content = pattern.sub(new_catch, form_content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Applied Regex replace to ProspectForm.jsx")

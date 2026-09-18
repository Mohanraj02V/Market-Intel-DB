import re

with open('src/components/prospects/ProspectForm.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_block = r"""    } catch \(err\) {
      let errorMessage = 'An error occurred while saving.';
      if \(err\.response\?\.data\) {
        if \(typeof err\.response\.data === 'string'\) {
          errorMessage = err\.response\.data;
        } else if \(err\.response\.data\.detail\) {
          errorMessage = err\.response\.data\.detail;
        } else {
          // It's a field-level error object from DRF
          const errors = \[\];
          for \(const \[field, messages\] of Object\.entries\(err\.response\.data\)\) {
            errors\.push\(\$\{field\}: \$\{Array\.isArray\(messages\) \? messages\.join\(' '\) : messages\}\);
          }
          errorMessage = errors\.join\(' \| '\);
        }
      } else if \(err\.message\) {
        errorMessage = err\.message;
      }
      setError\(errorMessage\);
    } finally {"""

new_block = """    } catch (err) {
      let errorMessage = 'An error occurred while saving.';
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.detail) {
          errorMessage = err.response.data.detail;
        } else {
          const formatError = (errObj, prefix = '') => {
            let msgs = [];
            for (const [key, value] of Object.entries(errObj)) {
              const readableKey = isNaN(key) ? key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : Item ;
              const fieldName = prefix ? ${prefix} ->  : readableKey;
              
              if (Array.isArray(value)) {
                if (typeof value[0] === 'string') {
                   msgs.push(${fieldName}: );
                } else if (typeof value[0] === 'object') {
                   value.forEach((v, i) => msgs.push(...formatError(v, ${fieldName} -> Item )));
                }
              } else if (typeof value === 'object' && value !== null) {
                msgs.push(...formatError(value, fieldName));
              } else {
                msgs.push(${fieldName}: );
              }
            }
            return msgs;
          };
          errorMessage = formatError(err.response.data).join(' | ');
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {"""

content = re.sub(old_block, new_block, content)

with open('src/components/prospects/ProspectForm.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

import re

filepath = 'frontend/src/pages/LqPipelinePage.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

target1 = """  const handleConfirmReverify = (item) => {
    dispatch(confirmReverification(item.id)).then(() => {
      openWorkspace(item);
    });
  };"""

replacement1 = """  const handleConfirmReverify = (item) => {
    dispatch(confirmReverification(item.id)).then((action) => {
      if (action.payload) {
        openWorkspace(action.payload);
      }
    });
  };"""

content = content.replace(target1, replacement1)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

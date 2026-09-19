import re

filepath = 'frontend/src/pages/LqPipelinePage.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

target1 = """  const handleConfirmReverify = (id) => {
    dispatch(confirmReverification(id));
  };"""

replacement1 = """  const handleConfirmReverify = (item) => {
    dispatch(confirmReverification(item.id)).then(() => {
      openWorkspace(item);
    });
  };"""

content = content.replace(target1, replacement1)

target2 = """                      {isUpdated ? (
                        <button
                          onClick={() => handleConfirmReverify(item.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold transition flex items-center gap-1 ml-auto"
                        >"""

replacement2 = """                      {isUpdated ? (
                        <button
                          onClick={() => handleConfirmReverify(item)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold transition flex items-center gap-1 ml-auto"
                        >"""

content = content.replace(target2, replacement2)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
